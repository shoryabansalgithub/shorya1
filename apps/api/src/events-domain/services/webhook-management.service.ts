import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as crypto from 'crypto';
import { isIP } from 'node:net';

@Injectable()
export class WebhookManagementService {
  private readonly logger = new Logger(WebhookManagementService.name);

  constructor(private readonly prisma: PrismaService) {}

  async registerWebhook(shopId: string, url: string, events: string[]) {
    this.validateEndpointUrl(url);
    if (!Array.isArray(events) || events.length === 0 || events.some((event) => typeof event !== 'string' || !event.trim())) {
      throw new BadRequestException('At least one valid event type is required.');
    }

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
    // The signing secret is returned only at creation time. Consumers must
    // persist it securely because it is deliberately omitted from later reads.
    return endpoint;
  }

  async getWebhooks(shopId: string) {
    return this.prisma.webhookEndpoint.findMany({
      where: { shopId },
      select: {
        id: true,
        url: true,
        events: true,
        isActive: true,
        description: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async revokeWebhook(shopId: string, endpointId: string) {
    return this.prisma.webhookEndpoint.update({
      where: { id: endpointId, shopId }, // Ensure tenant isolation
      data: { isActive: false }
    });
  }

  private validateEndpointUrl(value: string): void {
    let endpoint: URL;
    try {
      endpoint = new URL(value);
    } catch {
      throw new BadRequestException('Webhook URL must be a valid absolute HTTPS URL.');
    }

    if (endpoint.protocol !== 'https:' || endpoint.username || endpoint.password || endpoint.port) {
      throw new BadRequestException('Webhook URL must use HTTPS without embedded credentials or a custom port.');
    }

    const hostname = endpoint.hostname.toLowerCase();
    if (
      hostname === 'localhost' ||
      hostname.endsWith('.localhost') ||
      hostname === '::1' ||
      this.isPrivateIpv4(hostname) ||
      (isIP(hostname) === 6 && (hostname.startsWith('fc') || hostname.startsWith('fd') || hostname.startsWith('fe80')))
    ) {
      throw new BadRequestException('Webhook URL must not target a private or loopback address.');
    }
  }

  private isPrivateIpv4(hostname: string): boolean {
    if (isIP(hostname) !== 4) return false;
    const [first, second] = hostname.split('.').map(Number);
    return first === 10 || first === 127 || first === 0 || first >= 224 ||
      (first === 172 && second >= 16 && second <= 31) ||
      (first === 192 && second === 168) ||
      (first === 169 && second === 254);
  }
}
