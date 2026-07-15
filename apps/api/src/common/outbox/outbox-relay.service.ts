import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import { PrismaService } from '../../prisma/prisma.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { Prisma } from '@prisma/client';
import { EventsFeatureConfig } from '../../config/domains/features/events-feature.config';
import { CronConfig } from '../../config/domains/cron.config';

@Injectable()
export class OutboxRelayService implements OnApplicationBootstrap {
  private readonly logger = new Logger(OutboxRelayService.name);

  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue('system-events') private readonly eventQueue: Queue,
    private readonly eventsConfig: EventsFeatureConfig,
    private readonly cronConfig: CronConfig,
    private readonly schedulerRegistry: SchedulerRegistry
  ) {}

  onApplicationBootstrap() {
    const job = new CronJob(this.cronConfig.eventsOutboxRelayCron, () => {
      this.relayEvents();
    });
    this.schedulerRegistry.addCronJob('EventsOutboxRelayService', job);
    job.start();
  }

  async relayEvents() {
    const batchSize = this.eventsConfig.outboxProcessorBatchSize;
    
    try {
      await this.prisma.$transaction(async (tx) => {
        // 1. Fetch pending events with SKIP LOCKED
        // Using raw SQL to leverage row-level locking for multi-pod concurrency
        const events: any[] = await tx.$queryRaw`
          SELECT id, type, payload, status 
          FROM OutboxEvent 
          WHERE status = 'PENDING' 
          ORDER BY createdAt ASC 
          LIMIT ${batchSize} 
          FOR UPDATE SKIP LOCKED
        `;

        if (events.length === 0) return;

        this.logger.debug(`Relaying ${events.length} outbox events...`);

        // 2. Enqueue into BullMQ
        const jobs = events.map(event => {
          const rawPayload = typeof event.payload === 'string' ? JSON.parse(event.payload) : event.payload;
          const correlationId = rawPayload.correlationId || 'legacy-event';
          return {
            name: event.type,
            data: {
              eventId: event.id,
              correlationId,
              payload: rawPayload
            },
            opts: {
              jobId: event.id, // Guarantee exactly-once enqueue via BullMQ jobId deduplication
            }
          };
        });

        // If BullMQ fails or Redis is down, this throws and the transaction rolls back safely
        await this.eventQueue.addBulk(jobs);

        // 3. Update status to DONE
        const eventIds = events.map(e => e.id);
        await tx.$executeRaw`
          UPDATE OutboxEvent 
          SET status = 'DONE', processedAt = NOW(3)
          WHERE id IN (${Prisma.join(eventIds)})
        `;
      });
    } catch (error: any) {
      this.logger.error(`Failed to relay outbox events: ${error.message}`);
    }
  }
}
