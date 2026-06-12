import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../prisma/prisma.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { Prisma } from '@prisma/client';

@Injectable()
export class OutboxRelayService {
  private readonly logger = new Logger(OutboxRelayService.name);

  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue('system-events') private readonly eventQueue: Queue,
  ) {}

  @Cron(CronExpression.EVERY_5_SECONDS)
  async relayEvents() {
    const batchSize = 100;
    
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
              attempts: 3,
              backoff: { type: 'exponential', delay: 1000 },
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
