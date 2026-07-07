import { Controller, Get, Post, Put, Param, Body, UseGuards, Query, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TenantGuard } from '../iam/guards/tenant.guard';
import { CurrentShop } from '../iam/decorators/current-shop.decorator';
import { CurrentUser } from '../iam/decorators/current-user.decorator';
import { PurchaseRepository } from './repositories/purchase.repository';
import type { Request } from 'express';

@UseGuards(JwtAuthGuard, TenantGuard)
@Controller('purchases')
export class PurchaseController {
  constructor(private readonly repository: PurchaseRepository) {}

  @Post()
  async createPurchaseOrder(@CurrentShop() shopId: string, @CurrentUser('id') actorId: string, @Body() payload: any, @Req() req: Request) {
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
  async approvePurchaseOrder(@CurrentShop() shopId: string, @Param('id') id: string, @CurrentUser('id') actorId: string, @Body() body: any, @Req() req: Request) {
    return this.repository.approvePurchaseOrder(shopId, id, actorId, req.ip, body.comments, body.signature);
  }

  // Phase 3.4.2 Enterprise Additions
  
  @Put(':id/draft')
  async updateDraft(@CurrentShop() shopId: string, @Param('id') id: string, @CurrentUser('id') actorId: string, @Body() payload: any) {
    return this.repository.updateDraft(shopId, id, payload, actorId);
  }

  @Post(':id/submit')
  async submitPurchaseOrder(@CurrentShop() shopId: string, @Param('id') id: string, @CurrentUser('id') actorId: string, @Body() body: any) {
    return this.repository.submitPurchaseOrder(shopId, id, actorId, body.comments);
  }

  @Post(':id/reject')
  async rejectPurchaseOrder(@CurrentShop() shopId: string, @Param('id') id: string, @CurrentUser('id') actorId: string, @Body() body: any) {
    return this.repository.rejectPurchaseOrder(shopId, id, actorId, body.comments);
  }
}
