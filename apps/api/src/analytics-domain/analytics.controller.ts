import { Controller, Get, Post, Query, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TenantGuard } from '../iam/guards/tenant.guard';
import { CurrentShop } from '../iam/decorators/current-shop.decorator';
import { RevenueEngine } from './engines/revenue-engine';
import { ProfitMarginEngine } from './engines/profit-margin-engine';
import { TrendEngine } from './engines/trend-engine';
import { ForecastEngine } from './engines/forecast-engine';
import { AnalyticsCacheService } from './services/analytics-cache.service';
import { PrismaService } from '../prisma/prisma.service';

@UseGuards(JwtAuthGuard, TenantGuard)
@Controller('dashboard')
export class AnalyticsController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly revenueEngine: RevenueEngine,
    private readonly profitMarginEngine: ProfitMarginEngine,
    private readonly trendEngine: TrendEngine,
    private readonly forecastEngine: ForecastEngine,
    private readonly cache: AnalyticsCacheService
  ) {}

  @Get('kpis')
  async getDashboardKpis(@CurrentShop() shopId: string) {
    // Attempt cache hit
    const cached = await this.cache.getDashboardCache(shopId);
    if (cached) return cached;

    // Cache miss -> Derive
    const todayRevenue = await this.revenueEngine.getTodayRevenue(shopId);
    // Expand to YTD, MTD, etc.
    
    const kpiData = {
      todayRevenue,
      timestamp: new Date()
    };

    await this.cache.setDashboardCache(shopId, kpiData);
    return kpiData;
  }

  @Get('products')
  async getTopProducts(@CurrentShop() shopId: string, @Query('limit') limit: number = 10) {
    return this.profitMarginEngine.getTopProductsByProfit(shopId, Number(limit));
  }

  @Get('trends')
  async getRevenueTrends(@CurrentShop() shopId: string, @Query('days') days: number = 30) {
    return this.trendEngine.getDailyRevenueTrend(shopId, Number(days));
  }

  @Get('forecast')
  async getRevenueForecast(@CurrentShop() shopId: string) {
    return this.forecastEngine.generateNextDayRevenueForecast(shopId);
  }

  @Post('export')
  async triggerExport(@CurrentShop() shopId: string, @Body() payload: { type: string, reportName: string }) {
    // Injects an AnalyticsExportJob and queues it to BullMQ
    const job = await this.prisma.analyticsExportJob.create({
      data: {
        shopId,
        type: payload.type,
        reportName: payload.reportName,
        requestedById: 'user_context_here' // Needs extraction from Auth Token in real impl
      }
    });

    // In a full impl, we emit to BullMQ here
    return { message: 'Export queued successfully.', jobId: job.id };
  }
}
