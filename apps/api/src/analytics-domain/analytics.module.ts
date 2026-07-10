import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { KpiService } from './services/kpi.service';
import { ClassificationService } from './services/classification.service';
import { ForecastService } from './services/forecast.service';
import { RecommendationEngineService } from './services/recommendation-engine.service';
import { AnalyticsJobScheduler } from './services/analytics-job.scheduler';
import { AnalyticsController } from './analytics.controller';

@Module({
  imports: [PrismaModule],
  providers: [
    KpiService,
    ClassificationService,
    ForecastService,
    RecommendationEngineService,
    AnalyticsJobScheduler
  ],
  exports: [
    KpiService,
    RecommendationEngineService
  ]
})
export class AnalyticsModule {}
