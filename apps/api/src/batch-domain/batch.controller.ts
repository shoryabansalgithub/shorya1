import { Controller, Post, Body, Param, UseGuards, Put } from '@nestjs/common';
import { BatchService } from './services/batch.service';
import { ExpiryService } from './services/expiry.service';
import { RecallService } from './services/recall.service';
import { CreateBatchDto, AddBatchStockDto } from './dto/batch.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TenantGuard } from '../iam/guards/tenant.guard';
import { TenantContextService } from '../iam/tenant-context/tenant-context.service';

@UseGuards(JwtAuthGuard, TenantGuard)
@Controller('batches')
export class BatchController {
  constructor(
    private readonly batchService: BatchService,
    private readonly expiryService: ExpiryService,
    private readonly recallService: RecallService,
    private readonly tenantContext: TenantContextService
  ) {}

  @Post()
  async createBatch(@Body() dto: CreateBatchDto) {
    return this.batchService.createBatch(this.tenantContext.getShopId(), dto);
  }

  @Post(':batchId/stock')
  async addBatchStock(
    @Param('batchId') batchId: string,
    @Body() dto: AddBatchStockDto
  ) {
    return this.batchService.addBatchStock(this.tenantContext.getShopId(), batchId, dto);
  }

  @Post('sweep-expiry')
  async sweepExpiry() {
    const count = await this.expiryService.quarantineExpiredBatches();
    return { status: 'SUCCESS', quarantinedCount: count };
  }

  @Post(':batchId/recall')
  async recallBatch(
    @Param('batchId') batchId: string,
    @Body('reason') reason: string
  ) {
    // Dummy 'API_USER' since auth isn't in this snippet
    return this.recallService.initiateRecall(this.tenantContext.getShopId(), batchId, reason, 'API_USER');
  }
}
