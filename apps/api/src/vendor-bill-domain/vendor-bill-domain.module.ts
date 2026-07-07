import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { SalesEventsDomainModule } from '../sales-events-domain/sales-events-domain.module';
import { BullModule } from '@nestjs/bullmq';

import { VendorBillController } from './vendor-bill.controller';
import { VendorBillRepository } from './repositories/vendor-bill.repository';
import { VendorBillLifecycleService } from './services/vendor-bill-lifecycle.service';
import { VendorBillApprovalService } from './services/vendor-bill-approval.service';
import { VendorBillMatchingService } from './services/vendor-bill-matching.service';
import { VendorBillTaxService } from './services/vendor-bill-tax.service';
import { VendorBillOutstandingService } from './services/vendor-bill-outstanding.service';
import { VendorBillProcessorService } from './services/vendor-bill-processor.service';
import { PurchaseEventsDomainModule } from '../purchase-events-domain/purchase-events-domain.module';
import { StorageModule } from '../storage/storage.module';
import { DocumentModule } from '../common/document/document.module';

@Module({
  imports: [
    PrismaModule,
    SalesEventsDomainModule,
    PurchaseEventsDomainModule,
    StorageModule,
    DocumentModule,
    BullModule.registerQueue({ name: 'vendor-bills' })
  ],
  controllers: [VendorBillController],
  providers: [
    VendorBillRepository,
    VendorBillLifecycleService,
    VendorBillApprovalService,
    VendorBillMatchingService,
    VendorBillTaxService,
    VendorBillOutstandingService,
    VendorBillProcessorService
  ],
  exports: [VendorBillRepository]
})
export class VendorBillDomainModule {}
