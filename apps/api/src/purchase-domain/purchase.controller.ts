import { Controller, Get, Post, Param, Body, UseGuards, Query, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TenantGuard } from '../iam/guards/tenant.guard';
import { CurrentShop } from '../iam/decorators/current-shop.decorator';
import { PurchaseRepository } from './repositories/purchase.repository';
import type { Request } from 'express';

@UseGuards(JwtAuthGuard, TenantGuard)
@Controller('purchases')
export class PurchaseController {
  constructor(private readonly repository: PurchaseRepository) {}

  @Post()
  async createPurchaseOrder(@CurrentShop() shopId: string, @Body() payload: any, @Req() req: Request) {
    const actorId = 'actor_placeholder'; // Typically req.user.id
    const ipAddress = req.ip;
    return this.repository.createPurchaseOrder(shopId, payload, actorId, ipAddress);
  }

  @Get()
  async listPurchaseOrders(
    @CurrentShop() shopId: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number
  ) {
    return this.repository.listPurchaseOrders(shopId, limit ? Number(limit) : 50, offset ? Number(offset) : 0);
  }

  @Get(':id')
  async getPurchaseOrder(@CurrentShop() shopId: string, @Param('id') id: string) {
    return this.repository.getPurchaseOrder(shopId, id);
  }

  @Post(':id/approve')
  async approvePurchaseOrder(@CurrentShop() shopId: string, @Param('id') id: string, @Req() req: Request) {
    const actorId = 'actor_placeholder';
    return this.repository.approvePurchaseOrder(shopId, id, actorId, req.ip);
  }
}
