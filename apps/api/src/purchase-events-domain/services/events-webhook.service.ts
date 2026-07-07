import { Injectable, Logger } from '@nestjs/common';
import { Queue } from 'bullmq';
import { InjectQueue } from '@nestjs/bullmq';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class EventsWebhookService {
  private readonly logger = new Logger(EventsWebhookService.name);

  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue('webhook-delivery') private readonly webhookQueue: Queue
  ) {}

  /**
   * Routes an event from the Outbox to external webhooks securely via the enterprise delivery queue.
   */
  async dispatchWebhooksForEvent(shopId: string, outboxEventId: string, type: string, payload: any) {
    const endpoints = await this.prisma.webhookEndpoint.findMany({
      where: { shopId, isActive: true }
    });

    for (const endpoint of endpoints) {
      const subscribedEvents = endpoint.events as string[];
      if (subscribedEvents.includes('*') || subscribedEvents.includes(type)) {
        this.logger.debug(`Enqueuing webhook delivery for endpoint ${endpoint.id} and event ${outboxEventId}`);
        await this.webhookQueue.add('deliver-webhook', {
          endpointId: endpoint.id,
          eventId: outboxEventId,
          payload
        }, {
          jobId: `webhook-${endpoint.id}-${outboxEventId}`,
          attempts: 5,
          backoff: { type: 'exponential', delay: 60000 }
        });
      }
    }
  }
}
