import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { BullModule } from '@nestjs/bullmq';

import { PaymentAllocationEngine } from './engines/payment-allocation-engine';
import { PaymentValidationEngine } from './engines/payment-validation-engine';
import { IdempotencyEngine } from './engines/idempotency-engine';
import { PaymentLedgerEngine } from './engines/payment-ledger-engine';
import { PaymentCacheService } from './services/payment-cache.service';
import { PaymentReconciliationWorker } from './workers/payment-reconciliation.worker';
import { PaymentController } from './payment.controller';

@Module({
  imports: [
    PrismaModule,
    BullModule.registerQueue({
      name: 'payment-reconciliation-queue',
    }),
  ],
  controllers: [PaymentController],
  providers: [
    PaymentAllocationEngine,
    PaymentValidationEngine,
    IdempotencyEngine,
    PaymentLedgerEngine,
    PaymentCacheService,
    PaymentReconciliationWorker
  ],
  exports: [PaymentLedgerEngine, PaymentAllocationEngine]
})
export class PaymentDomainModule {}
