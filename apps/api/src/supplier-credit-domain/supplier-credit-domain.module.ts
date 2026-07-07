import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { SalesEventsDomainModule } from '../sales-events-domain/sales-events-domain.module';
import { BullModule } from '@nestjs/bullmq';

import { SupplierCreditController } from './supplier-credit.controller';
import { SupplierCreditRepository } from './repositories/supplier-credit.repository';
import { SupplierCreditLifecycleService } from './services/supplier-credit-lifecycle.service';
import { SupplierCreditAllocationService } from './services/supplier-credit-allocation.service';
import { SupplierCreditFinancialService } from './services/supplier-credit-financial.service';
import { SupplierCreditValidationService } from './services/supplier-credit-validation.service';
import { SupplierCreditApprovalService } from './services/supplier-credit-approval.service';
import { SupplierCreditProcessorService } from './services/supplier-credit-processor.service';
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
    BullModule.registerQueue({ name: 'supplier-credits' })
  ],
  controllers: [SupplierCreditController],
  providers: [
    SupplierCreditRepository,
    SupplierCreditLifecycleService,
    SupplierCreditAllocationService,
    SupplierCreditFinancialService,
    SupplierCreditValidationService,
    SupplierCreditApprovalService,
    SupplierCreditProcessorService
  ],
  exports: [SupplierCreditRepository]
})
export class SupplierCreditDomainModule {}
