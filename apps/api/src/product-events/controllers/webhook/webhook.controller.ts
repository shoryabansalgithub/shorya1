import { Controller, Get, Post, Delete, Param, Body, UseGuards, Req } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { JwtAuthGuard } from '../../../auth/jwt-auth.guard';
import { TenantGuard } from '../../../iam/guards/tenant.guard';

@UseGuards(JwtAuthGuard, TenantGuard)
@Controller('webhooks')
export class WebhookController {
  constructor(private readonly prisma: PrismaService) {}

  @Post()
  async createEndpoint(@Body() dto: any, @Req() req: any) {
    return this.prisma.webhookEndpoint.create({
      data: {
        shopId: req.shop.id,
        url: dto.url,
        secret: dto.secret, // Provide securely, or generate automatically
        events: dto.events || ['*'],
        description: dto.description
      }
    });
  }

  @Get()
  async getEndpoints(@Req() req: any) {
    return this.prisma.webhookEndpoint.findMany({
      where: { shopId: req.shop.id }
    });
  }

  @Get(':id/deliveries')
  async getDeliveries(@Param('id') id: string, @Req() req: any) {
    return this.prisma.webhookDelivery.findMany({
      where: { endpointId: id, endpoint: { shopId: req.shop.id } },
      orderBy: { createdAt: 'desc' },
      take: 50
    });
  }

  @Delete(':id')
  async deleteEndpoint(@Param('id') id: string, @Req() req: any) {
    await this.prisma.webhookEndpoint.delete({
      where: { id, shopId: req.shop.id }
    });
    return { deleted: true };
  }
}
