import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as crypto from 'crypto';

@Injectable()
export class WebhookDispatcherService {
  private readonly logger = new Logger(WebhookDispatcherService.name);

  constructor(private readonly prisma: PrismaService) {}

  /** Sends the event to each active subscription that requested its type. */
  async dispatch(shopId: string, eventType: string, payload: unknown, eventId: string): Promise<void> {
    const endpoints = await this.prisma.webhookEndpoint.findMany({
      where: { shopId, isActive: true },
    });

    const subscribed = endpoints.filter((endpoint) =>
      Array.isArray(endpoint.events) && endpoint.events.some((event) => event === eventType || event === '*'),
    );

    await Promise.all(subscribed.map((endpoint) => this.deliver(endpoint, eventType, payload, eventId)));
  }

  private async deliver(
    endpoint: { id: string; url: string; secret: string },
    eventType: string,
    payload: unknown,
    eventId: string,
  ): Promise<void> {
    const timestamp = new Date().toISOString();
    const body = JSON.stringify({ eventId, eventType, timestamp, payload });
    const signature = crypto.createHmac('sha256', endpoint.secret).update(`${timestamp}.${body}`).digest('hex');
    const startedAt = Date.now();

    try {
      const response = await fetch(endpoint.url, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-dukanai-event': eventType,
          'x-dukanai-signature': signature,
          'x-dukanai-timestamp': timestamp,
        },
        body,
        signal: AbortSignal.timeout(10_000),
      });
      if (!response.ok) throw new Error(`Webhook responded with HTTP ${response.status}`);

      await this.prisma.webhookDelivery.create({
        data: { endpointId: endpoint.id, eventId, eventType, payload: payload as any, status: 'SUCCESS', statusCode: response.status, latencyMs: Date.now() - startedAt },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown webhook delivery error';
      await this.prisma.webhookDelivery.create({
        data: { endpointId: endpoint.id, eventId, eventType, payload: payload as any, status: 'FAILED', errorMessage: message, latencyMs: Date.now() - startedAt },
      });
      this.logger.error(`Webhook delivery failed for endpoint ${endpoint.id}: ${message}`);
      throw error;
    }
  }
}
