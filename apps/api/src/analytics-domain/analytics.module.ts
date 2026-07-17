import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { KpiService } from './services/kpi.service';
import { ClassificationService } from './services/classification.service';
import { ForecastService } from './services/forecast.service';
import { RecommendationEngineService } from './services/recommendation-engine.service';
import { AnalyticsJobScheduler } from './services/analytics-job.scheduler';
import { AnalyticsController } from './analytics.controller';
import { RevenueEngine } from './engines/revenue-engine';
import { ProfitMarginEngine } from './engines/profit-margin-engine';
import { TrendEngine } from './engines/trend-engine';
import { ForecastEngine } from './engines/forecast-engine';
import { AnalyticsCacheService } from './services/analytics-cache.service';

@Module({
  imports: [PrismaModule],
  providers: [
    KpiService,
    ClassificationService,
    ForecastService,
    RecommendationEngineService,
    AnalyticsJobScheduler,
    RevenueEngine,
    ProfitMarginEngine,
    TrendEngine,
    ForecastEngine,
    AnalyticsCacheService,
  ],
  exports: [
    KpiService,
    RecommendationEngineService,
  ],
})
export class AnalyticsModule {}
