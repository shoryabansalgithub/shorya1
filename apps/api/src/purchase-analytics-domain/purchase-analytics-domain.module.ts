import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { SalesEventsDomainModule } from '../sales-events-domain/sales-events-domain.module';
import { BullModule } from '@nestjs/bullmq';

import { PurchaseAnalyticsController } from './purchase-analytics.controller';
import { AnalyticsRepository } from './repositories/analytics.repository';
import { AnalyticsDashboardService } from './services/analytics-dashboard.service';
import { AnalyticsVendorPerformanceService } from './services/analytics-vendor-performance.service';
import { AnalyticsTrendService } from './services/analytics-trend.service';
import { AnalyticsCostService } from './services/analytics-cost.service';
import { AnalyticsForecastingService } from './services/analytics-forecasting.service';
import { AnalyticsProcessorService } from './services/analytics-processor.service';
import { AnalyticsEventListener } from './services/analytics-event.listener';

@Module({
  imports: [
    PrismaModule, 
    SalesEventsDomainModule,
    BullModule.registerQueue({ name: 'purchase-analytics' })
  ],
  controllers: [PurchaseAnalyticsController],
  providers: [
    AnalyticsRepository,
    AnalyticsDashboardService,
    AnalyticsVendorPerformanceService,
    AnalyticsTrendService,
    AnalyticsCostService,
    AnalyticsForecastingService,
    AnalyticsProcessorService,
    AnalyticsEventListener
  ],
  exports: [AnalyticsRepository, AnalyticsDashboardService]
})
export class PurchaseAnalyticsDomainModule {}
