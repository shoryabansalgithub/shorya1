import { Injectable, Logger } from '@nestjs/common';
import { EventsRepository } from '../repositories/events.repository';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class EventsDeliveryService {
  private readonly logger = new Logger(EventsDeliveryService.name);

  constructor(
    private readonly repository: EventsRepository,
    private readonly eventEmitter: EventEmitter2
  ) {}

  /**
   * Internal Delivery Router.
   * Maps an OutboxEvent payload to NestJS local EventEmitter channels,
   * triggering decoupled listeners across the Monolith.
   */
  async routeInternalEvent(shopId: string, outboxEventId: string, type: string, payload: any) {
    this.logger.debug(`Routing internal event ${type} [${outboxEventId}]`);
    
    try {
      // Fire and await all registered listeners synchronously to guarantee delivery success tracking
      await this.eventEmitter.emitAsync(type, {
        shopId,
        outboxEventId,
        ...payload
      });
      
      await this.repository.logDeliverySuccess(shopId, outboxEventId, 'INTERNAL_ROUTER', 0);
      return true;
    } catch (error: any) {
      this.logger.error(`Failed to route event ${type}`, error.stack);
      await this.repository.logDeliveryFailure(shopId, outboxEventId, 'INTERNAL_ROUTER', error.message);
      throw error; // Will be caught by BullMQ processor for Retry/DLQ
    }
  }
}
