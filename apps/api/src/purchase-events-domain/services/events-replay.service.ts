import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class EventsReplayService {
  private readonly logger = new Logger(EventsReplayService.name);

  constructor(private readonly prisma: PrismaService) {}

  async scheduleReplay(shopId: string, aggregateId: string, actorId: string) {
    this.logger.log(`Scheduling replay for aggregate ${aggregateId}`);
    
    const replay = await this.prisma.purchaseEventReplay.create({
      data: {
        shopId,
        targetAggregateId: aggregateId,
        requestedById: actorId,
        status: 'PENDING'
      }
    });

    // In a full implementation, a BullMQ job scans OutboxEvents for this aggregate and resets their status to PENDING
    return replay;
  }
}
