import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { EventBusService } from './event-bus.service';

@Injectable()
export class EventReplayService {
  private readonly logger = new Logger(EventReplayService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventBus: EventBusService
  ) {}

  /**
   * Replays events from the immutable InventoryEventLog.
   * Can filter by date range, specific aggregates, or event types.
   */
  async replayEvents(shopId: string, filters: {
    startDate?: Date;
    endDate?: Date;
    eventType?: string;
    aggregateId?: string;
  }) {
    this.logger.log(`Starting Event Replay for shop ${shopId} with filters: ${JSON.stringify(filters)}`);

    const whereClause: any = { shopId };
    
    if (filters.startDate || filters.endDate) {
      whereClause.publishedAt = {};
      if (filters.startDate) whereClause.publishedAt.gte = filters.startDate;
      if (filters.endDate) whereClause.publishedAt.lte = filters.endDate;
    }
    
    if (filters.eventType) whereClause.eventType = filters.eventType;
    if (filters.aggregateId) whereClause.aggregateId = filters.aggregateId;

    const eventsToReplay = await this.prisma.inventoryEventLog.findMany({
      where: whereClause,
      orderBy: { publishedAt: 'asc' } // Guarantee exact historical ordering
    });

    this.logger.log(`Found ${eventsToReplay.length} events to replay.`);

    for (const log of eventsToReplay) {
      // Republish to the bus
      // In a robust implementation, we might set a flag `isReplay: true` in the metadata
      await this.eventBus.dispatch({
        eventId: log.id, // Keeping original ID to trigger Idempotency if already processed
        shopId: log.shopId,
        eventType: log.eventType,
        aggregateType: log.aggregateType,
        aggregateId: log.aggregateId,
        payload: log.payload,
        version: log.version
      });
    }

    this.logger.log(`Replay complete.`);
    return { replayedCount: eventsToReplay.length };
  }
}
