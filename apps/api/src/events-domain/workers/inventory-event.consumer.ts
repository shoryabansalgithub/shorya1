import { Injectable, Logger } from '@nestjs/common';
import { IdempotencyService } from '../services/idempotency.service';
import { InventoryProjectionService } from '../services/inventory-projection.service';
import { WebhookDispatcherService } from '../services/webhook-dispatcher.service';

@Injectable()
export class InventoryEventConsumer {
  private readonly logger = new Logger(InventoryEventConsumer.name);
  private readonly CONSUMER_ID = 'PrimaryInventoryEventConsumer';

  constructor(
    private readonly idempotency: IdempotencyService,
    private readonly projection: InventoryProjectionService,
    private readonly webhooks: WebhookDispatcherService
  ) {}

  /**
   * Simulates BullMQ @Process() decorated method.
   * Processes a strongly typed event, ensuring exactly-once execution.
   */
  async processEvent(job: { id: string; data: any }) {
    const event = job.data;
    
    // 1. Idempotency Check (Exactly-Once Semantics)
    const isNew = await this.idempotency.recordProcessing(event.eventId, this.CONSUMER_ID);
    if (!isNew) {
      this.logger.warn(`Event ${event.eventId} already processed by ${this.CONSUMER_ID}. Skipping.`);
      return;
    }

    try {
      this.logger.log(`Processing Event: ${event.eventType} [v${event.version}]`);

      // 2. CQRS Materialized View Projection
      if (event.aggregateType === 'Product' || event.aggregateType === 'InventoryItem') {
        await this.projection.updateProjection(event.shopId, event.aggregateId, event.payload);
      }

      // 3. Dispatch to Webhooks
      await this.webhooks.dispatch(event.shopId, event.eventType, event.payload);

    } catch (error: any) {
      this.logger.error(`Failed to process event ${event.eventId}: ${error.message}`);
      // BullMQ will handle retries based on backoff config, eventually sending to DLQ.
      throw error;
    }
  }
}
