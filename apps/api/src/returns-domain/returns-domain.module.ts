import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { BullModule } from '@nestjs/bullmq';

import { ReturnValidationEngine } from './engines/return-validation-engine';
import { ReverseInventoryEngine } from './engines/reverse-inventory-engine';
import { ReverseFinancialEngine } from './engines/reverse-financial-engine';
import { InspectionEngine } from './engines/inspection-engine';
import { ReturnsCacheService } from './services/returns-cache.service';
import { ReturnInspectionWorker, ReturnRefundWorker } from './workers/return-workers';
import { ReturnsController } from './returns.controller';

@Module({
  imports: [
    PrismaModule,
    BullModule.registerQueue({
      name: 'return-inspection-queue',
    }),
    BullModule.registerQueue({
      name: 'return-refund-queue',
    }),
  ],
  controllers: [ReturnsController],
  providers: [
    ReturnValidationEngine,
    ReverseInventoryEngine,
    ReverseFinancialEngine,
    InspectionEngine,
    ReturnsCacheService,
    ReturnInspectionWorker,
    ReturnRefundWorker
  ],
  exports: [ReturnValidationEngine, InspectionEngine]
})
export class ReturnsDomainModule {}
