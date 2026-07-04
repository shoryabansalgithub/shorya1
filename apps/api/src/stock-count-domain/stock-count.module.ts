import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { StockLedgerModule } from '../stock-ledger-domain/stock-ledger.module';
import { StockCountService } from './services/stock-count.service';
import { VarianceService } from './services/variance.service';
import { AdjustmentApprovalService } from './services/adjustment-approval.service';
import { AdjustmentPostingService } from './services/adjustment-posting.service';
import { StockCountController } from './stock-count.controller';

@Module({
  imports: [PrismaModule, StockLedgerModule],
  controllers: [StockCountController],
  providers: [
    StockCountService,
    VarianceService,
    AdjustmentApprovalService,
    AdjustmentPostingService
  ],
  exports: [
    StockCountService,
    VarianceService,
    AdjustmentApprovalService
  ]
})
export class StockCountModule {}
