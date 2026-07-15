import { Controller, Get, Post, Param, Body, UseGuards, NotFoundException, BadRequestException } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TenantGuard } from '../iam/guards/tenant.guard';
import { CurrentShop } from '../iam/decorators/current-shop.decorator';
import { PrismaService } from '../prisma/prisma.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { SalesFeatureConfig } from '../config/domains/features/sales-feature.config';

@UseGuards(JwtAuthGuard, TenantGuard)
@Controller('sales/events')
export class SalesEventsController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly salesFeatureConfig: SalesFeatureConfig,
    @InjectQueue('sales-events') private readonly salesEventsQueue: Queue
  ) {}

  @Get()
  async getEvents(@CurrentShop() shopId: string) {
    return this.prisma.outboxEvent.findMany({
      where: { shopId, type: { startsWith: 'Order' } }, // Simple filter for demo
      orderBy: { createdAt: 'desc' },
      take: this.salesFeatureConfig.recentEventsLimit
    });
  }

  @Get(':id')
  async getEventById(@CurrentShop() shopId: string, @Param('id') id: string) {
    const event = await this.prisma.outboxEvent.findUnique({
      where: { id }
    });

    if (!event || event.shopId !== shopId) {
      throw new NotFoundException('Event not found');
    }

    return event;
  }

  @Post('retry')
  async retryEvent(@CurrentShop() shopId: string, @Body('eventId') eventId: string) {
    const event = await this.prisma.outboxEvent.findUnique({
      where: { id: eventId }
    });

    if (!event || event.shopId !== shopId) {
      throw new NotFoundException('Event not found');
    }

    if (event.status === 'DONE') {
      throw new BadRequestException('Event is already processed successfully.');
    }

    // Force queue injection
    await this.salesEventsQueue.add(event.type, { eventId: event.id, ...event }, {
      jobId: `sales-event-retry-${event.id}-${Date.now()}` // Bypass idempotency for forced retry
    });

    await this.prisma.outboxEvent.update({
      where: { id: eventId },
      data: { status: 'PENDING', error: null, retryCount: 0 }
    });

    return { message: 'Event successfully pushed for retry.' };
  }

  @Get('status/queue')
  async getQueueStatus() {
    const waiting = await this.salesEventsQueue.getWaitingCount();
    const active = await this.salesEventsQueue.getActiveCount();
    const failed = await this.salesEventsQueue.getFailedCount();

    return {
      queue: 'sales-events',
      metrics: { waiting, active, failed }
    };
  }
}
