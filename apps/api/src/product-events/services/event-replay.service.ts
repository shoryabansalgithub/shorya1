import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class ProductEventReplayService {
  private readonly logger = new Logger(ProductEventReplayService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Replays an event from the permanent EventLog by re-injecting it into the Outbox.
   */
  async replayEvent(eventId: string, shopId: string): Promise<void> {
    const eventLog = await this.prisma.productEventLog.findUnique({
      where: { eventId, shopId }
    });

    if (!eventLog) throw new BadRequestException(`Event ${eventId} not found for replay`);

    await this.prisma.outboxEvent.create({
      data: {
        shopId: eventLog.shopId,
        tenantId: eventLog.tenantId,
        type: eventLog.eventType,
        payload: eventLog.payload as Prisma.InputJsonValue,
        correlationId: eventLog.correlationId,
        causationId: eventLog.eventId, // The causation of the replay is the original event!
        actorId: 'REPLAY_SYSTEM',
        entityId: eventLog.entityId,
        entityType: eventLog.entityType,
        status: 'PENDING',
      }
    });

    this.logger.log(`Successfully queued event ${eventId} for replay.`);
  }

  async getMetrics(shopId: string) {
    const totalEvents = await this.prisma.productEventLog.count({ where: { shopId } });
    const pendingOutbox = await this.prisma.outboxEvent.count({ where: { shopId, status: 'PENDING' } });
    const failedDeliveries = await this.prisma.webhookDelivery.count({ where: { endpoint: { shopId }, status: 'FAILED' } });
    const deadLetters = await this.prisma.deadLetterEvent.count({ where: { shopId, status: 'PENDING' } });

    return { totalEvents, pendingOutbox, failedDeliveries, deadLetters };
  }
}
