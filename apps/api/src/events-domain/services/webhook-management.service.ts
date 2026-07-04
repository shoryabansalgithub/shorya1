import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as crypto from 'crypto';

@Injectable()
export class WebhookManagementService {
  private readonly logger = new Logger(WebhookManagementService.name);

  constructor(private readonly prisma: PrismaService) {}

  async registerWebhook(shopId: string, url: string, events: string[]) {
    // Generate a secure secret for HMAC
    const secret = crypto.randomBytes(32).toString('hex');

    const endpoint = await this.prisma.webhookEndpoint.create({
      data: {
        shopId,
        url,
        secret,
        events: events as any
      }
    });

    this.logger.log(`Registered new webhook for shop ${shopId} -> ${url}`);
    return endpoint;
  }

  async getWebhooks(shopId: string) {
    return this.prisma.webhookEndpoint.findMany({
      where: { shopId }
    });
  }

  async revokeWebhook(shopId: string, endpointId: string) {
    return this.prisma.webhookEndpoint.update({
      where: { id: endpointId, shopId }, // Ensure tenant isolation
      data: { isActive: false }
    });
  }
}
