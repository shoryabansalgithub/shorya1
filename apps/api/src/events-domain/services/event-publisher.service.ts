import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';

export interface BaseInventoryEvent {
  type: string;
  entityType: string;
  entityId: string;
  payload: any;
  correlationId?: string;
  causationId?: string;
  actorId?: string;
}

@Injectable()
export class EventPublisherService {
  private readonly logger = new Logger(EventPublisherService.name);

  /**
   * Appends an event to the Outbox table within the boundaries of an existing Prisma Transaction.
   * This guarantees that if the business logic rolls back, the event is NEVER published.
   */
  async publish(tx: Prisma.TransactionClient, shopId: string, event: BaseInventoryEvent) {
    const outboxEvent = await tx.outboxEvent.create({
      data: {
        shopId,
        type: event.type,
        entityType: event.entityType,
        entityId: event.entityId,
        payload: event.payload as any,
        correlationId: event.correlationId,
        causationId: event.causationId,
        actorId: event.actorId,
        status: 'PENDING'
      }
    });

    this.logger.debug(`[Outbox] Staged event ${event.type} for entity ${event.entityId}`);
    return outboxEvent;
  }
}
