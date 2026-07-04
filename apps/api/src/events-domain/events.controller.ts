import { Controller, Post, Body, Get, UseGuards, Param, Delete } from '@nestjs/common';
import { EventReplayService } from './services/event-replay.service';
import { WebhookManagementService } from './services/webhook-management.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TenantGuard } from '../iam/guards/tenant.guard';
import { CurrentShop } from '../iam/decorators/current-shop.decorator';

@UseGuards(JwtAuthGuard, TenantGuard)
@Controller('events')
export class EventsController {
  constructor(
    private readonly replayService: EventReplayService,
    private readonly webhookService: WebhookManagementService
  ) {}

  @Post('replay')
  async triggerReplay(
    @CurrentShop() shopId: string,
    @Body() body: { startDate?: string; endDate?: string; eventType?: string; aggregateId?: string }
  ) {
    const filters = {
      startDate: body.startDate ? new Date(body.startDate) : undefined,
      endDate: body.endDate ? new Date(body.endDate) : undefined,
      eventType: body.eventType,
      aggregateId: body.aggregateId
    };

    const result = await this.replayService.replayEvents(shopId, filters);
    return { status: 'ACCEPTED', ...result };
  }

  @Post('webhooks')
  async registerWebhook(
    @CurrentShop() shopId: string,
    @Body() body: { url: string; events: string[] }
  ) {
    return this.webhookService.registerWebhook(shopId, body.url, body.events);
  }

  @Get('webhooks')
  async getWebhooks(@CurrentShop() shopId: string) {
    return this.webhookService.getWebhooks(shopId);
  }

  @Delete('webhooks/:id')
  async revokeWebhook(@CurrentShop() shopId: string, @Param('id') endpointId: string) {
    return this.webhookService.revokeWebhook(shopId, endpointId);
  }
}
