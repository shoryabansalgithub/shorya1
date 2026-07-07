import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class PurchaseOutboxRelayCron {
  private readonly logger = new Logger(PurchaseOutboxRelayCron.name);
  private isProcessing = false;

  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue('purchase-events') private readonly purchaseEventsQueue: Queue
  ) {}

  /**
   * Sweeps the OutboxEvent table for PENDING purchase events and relays them to BullMQ.
   */
  @Cron(CronExpression.EVERY_SECOND)
  async relayPendingEvents() {
    if (this.isProcessing) return;
    this.isProcessing = true;

    try {
      const pendingEvents = await this.prisma.outboxEvent.findMany({
        where: {
          status: 'PENDING',
          OR: [
            { type: { startsWith: 'Purchase' } },
            { type: { startsWith: 'GRN' } },
            { type: { startsWith: 'VendorBill' } },
            { type: { startsWith: 'SupplierCredit' } }
          ]
        },
        take: 50,
        orderBy: { createdAt: 'asc' }
      });

      if (pendingEvents.length === 0) {
        this.isProcessing = false;
        return;
      }

      this.logger.debug(`Found ${pendingEvents.length} PENDING purchase events to relay.`);

      for (const event of pendingEvents) {
        try {
          // Enqueue to primary purchase router
          await this.purchaseEventsQueue.add(event.type, { outboxEventId: event.id, ...event }, {
            jobId: `purchase-event-${event.id}`, // Idempotency key
            removeOnComplete: true,
            attempts: 3,
            backoff: { type: 'exponential', delay: 1000 }
          });
        } catch (error: any) {
          this.logger.error(`Failed to enqueue outbox event ${event.id}: ${error.message}`);
        }
      }
    } catch (err) {
      this.logger.error(`Outbox Processor encountered an error: ${(err as Error).message}`);
    } finally {
      this.isProcessing = false;
    }
  }
}
