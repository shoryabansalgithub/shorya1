import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { EventRouterService } from '../services/event-router.service';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class OutboxProcessorWorker {
  private readonly logger = new Logger(OutboxProcessorWorker.name);
  private isProcessing = false;

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventRouter: EventRouterService,
  ) {}

  /**
   * Polls the outbox continuously.
   * In a true distributed system, we might use Debezium (CDC) or Prisma Pulse,
   * but polling is fine for this simulated architecture context.
   */
  @Cron(CronExpression.EVERY_SECOND)
  async processOutbox() {
    if (this.isProcessing) return;
    this.isProcessing = true;

    try {
      // Find up to 100 PENDING outbox events
      const events = await this.prisma.outboxEvent.findMany({
        where: { 
          status: 'PENDING',
          OR: [
            { type: { startsWith: 'Product' } },
            { type: { startsWith: 'Inventory' } },
            { type: { startsWith: 'Category' } },
            { type: { startsWith: 'Brand' } }
          ]
        },
        take: 100,
        orderBy: { createdAt: 'asc' }
      });

      if (events.length === 0) {
        this.isProcessing = false;
        return;
      }

      this.logger.debug(`Found ${events.length} PENDING Outbox events...`);

      for (const event of events) {
        try {
          await this.eventRouter.routeEvent(event.id);
        } catch (err) {
          this.logger.error(`Failed to route event ${event.id}. It will be retried later.`);
        }
      }

    } catch (err) {
      this.logger.error(`Outbox Processor encountered an error: ${(err as Error).message}`);
    } finally {
      this.isProcessing = false;
    }
  }
}
