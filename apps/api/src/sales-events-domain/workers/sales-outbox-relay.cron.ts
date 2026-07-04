import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class SalesOutboxRelayCron {
  private readonly logger = new Logger(SalesOutboxRelayCron.name);

  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue('sales-events') private readonly salesEventsQueue: Queue
  ) {}

  /**
   * Sweeps the OutboxEvent table for PENDING sales events and relays them to BullMQ.
   */
  @Cron(CronExpression.EVERY_SECOND)
  async relayPendingEvents() {
    // Only pick up events relevant to Sales domain (prevent overlapping with Product outbox)
    // A more advanced system would have isolated outboxes, but here we filter by prefix.
    const pendingEvents = await this.prisma.outboxEvent.findMany({
      where: {
        status: 'PENDING',
        OR: [
          { type: { startsWith: 'Order' } },
          { type: { startsWith: 'Invoice' } },
          { type: { startsWith: 'Payment' } },
          { type: { startsWith: 'Return' } },
          { type: { startsWith: 'Exchange' } }
        ]
      },
      take: 50,
      orderBy: { createdAt: 'asc' }
    });

    if (pendingEvents.length === 0) return;

    this.logger.log(`Found ${pendingEvents.length} PENDING sales events to relay.`);

    for (const event of pendingEvents) {
      try {
        // Enqueue to primary router
        await this.salesEventsQueue.add(event.type, { eventId: event.id, ...event }, {
          jobId: `sales-event-${event.id}`, // Idempotency key
          removeOnComplete: true,
          attempts: 3,
          backoff: { type: 'exponential', delay: 1000 }
        });

        // Mark as DONE
        await this.prisma.outboxEvent.update({
          where: { id: event.id },
          data: { status: 'DONE', processedAt: new Date() }
        });
      } catch (error: any) {
        this.logger.error(`Failed to enqueue outbox event ${event.id}: ${error.message}`);
        await this.prisma.outboxEvent.update({
          where: { id: event.id },
          data: { 
            retryCount: { increment: 1 },
            status: event.retryCount >= 4 ? 'FAILED' : 'PENDING',
            error: error.message
          }
        });
      }
    }
  }
}
