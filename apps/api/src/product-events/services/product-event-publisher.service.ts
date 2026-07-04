import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

export interface EnterpriseEventPayload {
  eventId: string;
  eventType: string;
  eventVersion: string;
  tenantId?: string;
  shopId: string;
  entityId?: string;
  entityType?: string;
  timestamp: Date;
  correlationId?: string;
  causationId?: string;
  actorId?: string;
  payload: Record<string, any>;
  metadata?: Record<string, any>;
}

@Injectable()
export class ProductEventPublisher {
  private readonly logger = new Logger(ProductEventPublisher.name);

  /**
   * Publishes an event reliably via the Transactional Outbox pattern.
   * MUST be executed inside an existing Prisma Transaction to guarantee atomicity.
   */
  async publish(
    tx: Prisma.TransactionClient,
    event: Omit<EnterpriseEventPayload, 'eventId' | 'timestamp' | 'eventVersion'>,
    version: string = 'v1'
  ): Promise<void> {
    const eventId = uuidv4();
    const timestamp = new Date();

    const fullEvent: EnterpriseEventPayload = {
      ...event,
      eventId,
      eventVersion: version,
      timestamp,
    };

    try {
      // 1. Write to OutboxEvent for temporary holding & background processing
      await tx.outboxEvent.create({
        data: {
          shopId: event.shopId,
          tenantId: event.tenantId,
          type: event.eventType,
          payload: fullEvent as unknown as Prisma.InputJsonValue,
          correlationId: event.correlationId,
          causationId: event.causationId,
          actorId: event.actorId,
          entityId: event.entityId,
          entityType: event.entityType,
          status: 'PENDING',
        }
      });

      // 2. Write to permanent ProductEventLog for historical replay and audit
      await tx.productEventLog.create({
        data: {
          shopId: event.shopId,
          tenantId: event.tenantId,
          eventId: eventId,
          eventType: event.eventType,
          eventVersion: version,
          entityId: event.entityId,
          entityType: event.entityType,
          timestamp: timestamp,
          correlationId: event.correlationId,
          causationId: event.causationId,
          actorId: event.actorId,
          payload: fullEvent.payload as Prisma.InputJsonValue,
          metadata: fullEvent.metadata as Prisma.InputJsonValue | undefined,
        }
      });

      this.logger.debug(`Outbox committed for event: ${event.eventType} [${eventId}]`);
    } catch (err) {
      this.logger.error(`Failed to write event to Outbox: ${(err as Error).message}`);
      throw err; // MUST throw to rollback the parent business transaction
    }
  }
}
