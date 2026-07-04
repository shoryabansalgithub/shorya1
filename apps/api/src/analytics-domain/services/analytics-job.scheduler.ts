import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { KpiService } from './kpi.service';
import { ClassificationService } from './classification.service';
import { ForecastService } from './forecast.service';
import { RecommendationEngineService } from './recommendation-engine.service';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AnalyticsJobScheduler {
  private readonly logger = new Logger(AnalyticsJobScheduler.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly kpiService: KpiService,
    private readonly classificationService: ClassificationService,
    private readonly forecastService: ForecastService,
    private readonly recommendationEngine: RecommendationEngineService
  ) {}

  /**
   * Main Analytics Orchestrator
   * Runs nightly to update the entire CQRS analytical layer for all tenants.
   * Can also be triggered via BullMQ for distributed processing.
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async runDailyAnalytics() {
    this.logger.log('--- STARTING GLOBAL ENTERPRISE INVENTORY ANALYTICS JOB ---');
    
    // In production, we'd paginate shops.
    const shops = await this.prisma.shop.findMany({ select: { id: true } });

    for (const shop of shops) {
      try {
        await this.kpiService.calculateDailyKpis(shop.id);
        await this.classificationService.classifyInventory(shop.id);
        await this.forecastService.generateForecasts(shop.id);
        await this.recommendationEngine.generateRecommendations(shop.id);
      } catch (error: any) {
        this.logger.error(`Analytics failed for shop ${shop.id}: ${error.message}`);
      }
    }

    this.logger.log('--- GLOBAL ENTERPRISE INVENTORY ANALYTICS JOB COMPLETE ---');
  }
}
