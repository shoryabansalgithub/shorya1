import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { EventsModule } from '../events-domain/events.module';
import { BullModule } from '@nestjs/bullmq';

import { PricingRuleEngine } from './engines/pricing-rule-engine';
import { PriceSimulationEngine } from './engines/price-simulation-engine';
import { PricingCacheService } from './services/pricing-cache.service';
import { PricingSchedulerWorker } from './workers/pricing-scheduler.worker';
import { PricingController } from './pricing.controller';

@Module({
  imports: [
    PrismaModule,
    EventsModule,
    BullModule.registerQueue({
      name: 'pricing-scheduler-queue',
    }),
  ],
  controllers: [PricingController],
  providers: [
    PricingRuleEngine,
    PriceSimulationEngine,
    PricingCacheService,
    PricingSchedulerWorker
  ],
  exports: [PriceSimulationEngine]
})
export class PricingDomainModule {}
