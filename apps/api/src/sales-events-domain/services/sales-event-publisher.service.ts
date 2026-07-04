import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';

export interface SalesEventPayload {
  eventType: string;
  aggregateId: string;
  aggregateType: string;
  payload: any;
  actorId?: string;
  tenantId?: string;
  correlationId?: string;
  causationId?: string;
}

@Injectable()
export class SalesEventPublisher {
  private readonly logger = new Logger(SalesEventPublisher.name);

  /**
   * Appends an event to the OutboxEvent table using the provided Prisma Transaction context.
   * This guarantees that the event is only committed if the business logic succeeds.
   */
  async publish(
    tx: Prisma.TransactionClient,
    shopId: string,
    event: SalesEventPayload
  ): Promise<void> {
    this.logger.debug(`Publishing ${event.eventType} to Outbox for Shop ${shopId}`);

    await tx.outboxEvent.create({
      data: {
        shopId,
        tenantId: event.tenantId,
        type: event.eventType,
        payload: event.payload,
        correlationId: event.correlationId,
        causationId: event.causationId,
        actorId: event.actorId,
        entityId: event.aggregateId,
        entityType: event.aggregateType,
        status: 'PENDING',
        retryCount: 0
      }
    });
  }
}
