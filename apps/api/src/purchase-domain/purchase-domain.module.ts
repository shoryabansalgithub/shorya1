import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { SalesEventsDomainModule } from '../sales-events-domain/sales-events-domain.module';

import { PurchaseNumberEngine } from './services/purchase-number-engine.service';
import { PurchaseLifecycleService } from './services/purchase-lifecycle.service';
import { PurchaseValidationService } from './services/purchase-validation.service';
import { PurchaseAuditService } from './services/purchase-audit.service';
import { PurchaseRepository } from './repositories/purchase.repository';
import { PurchaseController } from './purchase.controller';

@Module({
  imports: [PrismaModule, SalesEventsDomainModule],
  controllers: [PurchaseController],
  providers: [
    PurchaseNumberEngine,
    PurchaseLifecycleService,
    PurchaseValidationService,
    PurchaseAuditService,
    PurchaseRepository
  ],
  exports: [PurchaseRepository]
})
export class PurchaseDomainModule {}
