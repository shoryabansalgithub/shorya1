import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import { BullConfig } from '../../config/domains/bull.config';
import { CronConfig } from '../../config/domains/cron.config';
import { EventsFeatureConfig } from '../../config/domains/features/events-feature.config';

@Injectable()
export class SalesOutboxRelayCron implements OnApplicationBootstrap {
  private readonly logger = new Logger(SalesOutboxRelayCron.name);

  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue('sales-events') private readonly salesEventsQueue: Queue,
    private readonly bullConfig: BullConfig,
    private readonly cronConfig: CronConfig,
    private readonly eventsConfig: EventsFeatureConfig,
    private readonly schedulerRegistry: SchedulerRegistry
  ) {}

  onApplicationBootstrap() {
    const job = new CronJob(this.cronConfig.salesOutboxRelayCron, () => {
      this.relayPendingEvents();
    });
    this.schedulerRegistry.addCronJob('SalesOutboxRelayCron', job);
    job.start();
  }

  /**
   * Sweeps the OutboxEvent table for PENDING sales events and relays them to BullMQ.
   */
  async relayPendingEvents() {
    const batchSize = this.eventsConfig.outboxProcessorBatchSize;
    
    try {
      await this.prisma.$transaction(async (tx) => {
        // 1. Fetch pending events with SKIP LOCKED
        const events: any[] = await tx.$queryRaw`
          SELECT id, type, payload, status, retryCount 
          FROM OutboxEvent 
          WHERE status = 'PENDING' 
            AND (type LIKE 'Order%' OR type LIKE 'Invoice%' OR type LIKE 'Payment%' OR type LIKE 'Return%' OR type LIKE 'Exchange%')
          ORDER BY createdAt ASC 
          LIMIT ${batchSize} 
          FOR UPDATE SKIP LOCKED
        `;

        if (events.length === 0) return;

        this.logger.log(`Found ${events.length} PENDING sales events to relay.`);

        // 2. Enqueue into BullMQ
        const jobs = events.map(event => {
          return {
            name: event.type,
            data: {
              eventId: event.id,
              ...event
            },
            opts: {
              jobId: `sales-event-${event.id}`, // Idempotency key
              removeOnComplete: this.bullConfig.removeOnComplete,
              attempts: this.bullConfig.defaultAttempts,
              backoff: { type: (this.bullConfig.backoffType || 'exponential') as 'exponential' | 'fixed', delay: this.bullConfig.backoffDelay }
            }
          };
        });

        // If BullMQ fails or Redis is down, this throws and the transaction rolls back safely
        await this.salesEventsQueue.addBulk(jobs);

        // 3. Update status to DONE
        const eventIds = events.map(e => e.id);
        const { Prisma } = await import('@prisma/client');
        await tx.$executeRaw`
          UPDATE OutboxEvent 
          SET status = 'DONE', processedAt = NOW(3)
          WHERE id IN (${Prisma.join(eventIds)})
        `;
      });
    } catch (error: any) {
      this.logger.error(`Failed to relay sales outbox events: ${error.message}`);
    }
  }
}
