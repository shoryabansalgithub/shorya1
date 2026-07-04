import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { WebhookDispatcherService } from '../services/webhook-dispatcher.service';
import { EventBusService } from '../services/event-bus.service';

@Injectable()
export class OutboxRelayWorker {
  private readonly logger = new Logger(OutboxRelayWorker.name);
  private isProcessing = false;

  constructor(
    private readonly prisma: PrismaService,
    private readonly webhookService: WebhookDispatcherService,
    private readonly eventBus: EventBusService
  ) {}

  /**
   * Sweeps the OutboxEvent table for PENDING events and processes them.
   * Designed to run periodically (e.g., via @nestjs/schedule Cron or BullMQ repeatable job).
   */
  async processPendingEvents() {
    if (this.isProcessing) return;
    this.isProcessing = true;

    try {
      // 1. Fetch a batch of pending events.
      // We process them one by one to avoid large blocking transactions during relay.
      const events = await this.prisma.outboxEvent.findMany({
        where: { status: 'PENDING' },
        take: 100,
        orderBy: { createdAt: 'asc' }
      });

      if (events.length === 0) {
        this.isProcessing = false;
        return;
      }

      this.logger.log(`[Outbox Relay] Processing ${events.length} pending events...`);

      for (const event of events) {
        try {
          // 2. Dispatch to the Event Bus (which writes to EventLog and eventually BullMQ)
          await this.eventBus.dispatch({
            eventId: event.id,
            shopId: event.shopId,
            eventType: (event as any).eventType || event.type, // Backwards compat with Epic 2 Outbox format
            aggregateType: (event as any).aggregateType || 'System',
            aggregateId: (event as any).aggregateId || 'System',
            payload: event.payload
          });
          
          // Also dispatch immediate Webhooks for legacy backwards compatibility (Phase 3.2.7)
          const webhookSuccess = await this.webhookService.dispatch(
            event.shopId, 
            event.type, 
            event.payload
          );

          if (!webhookSuccess) {
            throw new Error('Webhook dispatch failed');
          }

          // 3. Mark as DONE
          await this.prisma.outboxEvent.update({
            where: { id: event.id },
            data: { 
              status: 'DONE', 
              processedAt: new Date(),
              retryCount: event.retryCount + 1
            }
          });

        } catch (error: any) {
          this.logger.error(`[Outbox Relay] Failed to process event ${event.id}: ${error.message}`);
          
          // 4. Mark as FAILED or increment retry
          await this.prisma.outboxEvent.update({
            where: { id: event.id },
            data: { 
              status: event.retryCount >= 3 ? 'FAILED' : 'PENDING', 
              error: error.message,
              retryCount: event.retryCount + 1
            }
          });
        }
      }
    } finally {
      this.isProcessing = false;
    }
  }
}
