import { Controller, Post, Body, Param, UseGuards, Put } from '@nestjs/common';
import { StockCountService } from './services/stock-count.service';
import { VarianceService } from './services/variance.service';
import { AdjustmentApprovalService } from './services/adjustment-approval.service';
import { CreateStockCountSessionDto, SubmitCountItemDto, CreateAdjustmentRequestDto } from './dto/stock-count.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TenantGuard } from '../iam/guards/tenant.guard';
import { TenantContextService } from '../iam/tenant-context/tenant-context.service';
import { CurrentUser } from '../iam/decorators/current-user.decorator';
import { SafeUserDto } from '../users/dto/safe-user.dto';

@UseGuards(JwtAuthGuard, TenantGuard)
@Controller('stock-counts')
export class StockCountController {
  constructor(
    private readonly countService: StockCountService,
    private readonly varianceService: VarianceService,
    private readonly approvalService: AdjustmentApprovalService,
    private readonly tenantContext: TenantContextService
  ) {}

  @Post('sessions')
  async startSession(@Body() dto: CreateStockCountSessionDto) {
    return this.countService.startCountSession(this.tenantContext.getShopId(), dto);
  }

  @Post('sessions/:sessionId/complete')
  async completeSession(@Param('sessionId') sessionId: string) {
    return this.countService.completeCountSession(this.tenantContext.getShopId(), sessionId);
  }

  @Put('sessions/:sessionId/items')
  async submitCountItem(
    @Param('sessionId') sessionId: string,
    @Body() dto: SubmitCountItemDto
  ) {
    return this.varianceService.calculateAndSaveVariance(
      this.tenantContext.getShopId(),
      sessionId,
      dto.inventoryItemId,
      dto.countedQuantity
    );
  }

  @Post('adjustments')
  async requestAdjustment(@Body() dto: CreateAdjustmentRequestDto, @CurrentUser() user: SafeUserDto) {
    return this.approvalService.requestAdjustment(this.tenantContext.getShopId(), user.id, dto);
  }

  @Post('adjustments/:id/approve')
  async approveAdjustment(@Param('id') id: string, @CurrentUser() user: SafeUserDto) {
    return this.approvalService.approveAdjustment(this.tenantContext.getShopId(), id, user.id);
  }
}
