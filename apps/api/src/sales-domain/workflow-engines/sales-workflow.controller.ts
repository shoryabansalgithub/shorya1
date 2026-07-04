import { Controller, Post, Param, Body, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { TenantGuard } from '../../iam/guards/tenant.guard';
import { CurrentShop } from '../../iam/decorators/current-shop.decorator';
import { WorkflowOrchestrator } from './workflow-orchestrator';
import { OrderSplitEngine } from './order-split-engine';
import { SalesOrderStatus } from '@prisma/client';

@UseGuards(JwtAuthGuard, TenantGuard)
@Controller('sales/workflow')
export class SalesWorkflowController {
  constructor(
    private readonly orchestrator: WorkflowOrchestrator,
    private readonly splitEngine: OrderSplitEngine
  ) {}

  @Post(':id/transition')
  async transitionState(
    @CurrentShop() shopId: string,
    @Param('id') orderId: string,
    @Body('status') newStatus: SalesOrderStatus,
    @Req() req: any
  ) {
    return this.orchestrator.transitionState(shopId, orderId, newStatus, req.user.sub, { reason: 'Manual Override' });
  }

  @Post(':id/split')
  async splitOrder(
    @CurrentShop() shopId: string,
    @Param('id') orderId: string,
    @Body('linesToExtractIds') linesToExtractIds: string[]
  ) {
    return this.splitEngine.splitOrder(shopId, orderId, linesToExtractIds);
  }
}
