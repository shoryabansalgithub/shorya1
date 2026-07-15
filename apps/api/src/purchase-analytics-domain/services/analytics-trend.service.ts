import { Injectable, Inject } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { AnalyticsFeatureConfig } from '../../config/domains/features/analytics-feature.config';
import { CacheConfig } from '../../config/domains/cache.config';

@Injectable()
export class AnalyticsTrendService {
  constructor(private readonly prisma: PrismaService,
    private readonly analyticsFeatureConfig: AnalyticsFeatureConfig,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly cacheConfig: CacheConfig
  ) {}

  async getTrends(shopId: string, periodType: string) {
    const cacheKey = `trends:${shopId}:${periodType}`;
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) return cached;

    const trends = await this.prisma.purchaseTrendSnapshot.findMany({
      where: { shopId, periodType },
      orderBy: { periodStart: 'asc' },
      take: this.analyticsFeatureConfig.trendAnalysisLimit
    });

    await this.cacheManager.set(cacheKey, trends, this.cacheConfig.analyticsTrendTtlMs); // 1 hour cache
    return trends;
  }

  async getCategorySpend(shopId: string) {
    const cacheKey = `category_spend:${shopId}`;
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) return cached;

    const spend = await this.prisma.purchaseCategorySpendSnapshot.findMany({
      where: { shopId },
      orderBy: { totalSpend: 'desc' },
      take: this.analyticsFeatureConfig.recentOrdersLimit
    });

    await this.cacheManager.set(cacheKey, spend, this.cacheConfig.analyticsTrendTtlMs);
    return spend;
  }
}
