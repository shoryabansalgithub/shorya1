import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { WebhookDispatcherService } from '../services/webhook-dispatcher.service';
import { EventBusService } from '../services/event-bus.service';
import { EventsFeatureConfig } from '../../config/domains/features/events-feature.config';

@Injectable()
export class OutboxRelayWorker {
  private readonly logger = new Logger(OutboxRelayWorker.name);
  private isProcessing = false;

  constructor(
    private readonly prisma: PrismaService,
    private readonly webhookService: WebhookDispatcherService,
    private readonly eventBus: EventBusService,
    private readonly eventsFeatureConfig: EventsFeatureConfig
  ) {}

  /**
   * Sweeps the OutboxEvent table for PENDING events and processes them.
   * Designed to run periodically (e.g., via @nestjs/schedule Cron or BullMQ repeatable job).
   */
  async processPendingEvents() {
    if (this.isProcessing) return;
    this.isProcessing = true;

    try {
      await this.prisma.$transaction(async (tx) => {
        const batchSize = this.eventsFeatureConfig.outboxProcessorBatchSize;
        const events = await tx.$queryRaw<any[]>`
          SELECT id, shopId, type, payload, status, retryCount, eventType, aggregateType, aggregateId
          FROM OutboxEvent 
          WHERE status = 'PENDING' 
          ORDER BY createdAt ASC 
          LIMIT ${batchSize} 
          FOR UPDATE SKIP LOCKED
        `;

        if (events.length === 0) {
          return;
        }

        this.logger.log(`[Outbox Relay] Processing ${events.length} pending events...`);

        for (const event of events) {
          try {
            const rawPayload = typeof event.payload === 'string' ? JSON.parse(event.payload) : event.payload;

            // 2. Dispatch to the Event Bus (which writes to EventLog and eventually BullMQ)
            await this.eventBus.dispatch({
              eventId: event.id,
              shopId: event.shopId,
              eventType: event.eventType || event.type, // Backwards compat with Epic 2 Outbox format
              aggregateType: event.aggregateType || 'System',
              aggregateId: event.aggregateId || 'System',
              payload: rawPayload
            });
            
            // Also dispatch immediate Webhooks for legacy backwards compatibility (Phase 3.2.7)
            const webhookSuccess = await this.webhookService.dispatch(
              event.shopId, 
              event.type, 
              rawPayload
            );

            if (!webhookSuccess) {
              throw new Error('Webhook dispatch failed');
            }

            // 3. Mark as DONE
            await tx.$executeRaw`
              UPDATE OutboxEvent 
              SET status = 'DONE', processedAt = NOW(3), retryCount = ${event.retryCount + 1}
              WHERE id = ${event.id}
            `;

          } catch (error: any) {
            this.logger.error(`[Outbox Relay] Failed to process event ${event.id}: ${error.message}`);
            
            // 4. Mark as FAILED or increment retry
            const newStatus = event.retryCount >= 3 ? 'FAILED' : 'PENDING';
            await tx.$executeRaw`
              UPDATE OutboxEvent 
              SET status = ${newStatus}, error = ${error.message}, retryCount = ${event.retryCount + 1}
              WHERE id = ${event.id}
            `;
          }
        }
      });
    } finally {
      this.isProcessing = false;
    }
  }
}
