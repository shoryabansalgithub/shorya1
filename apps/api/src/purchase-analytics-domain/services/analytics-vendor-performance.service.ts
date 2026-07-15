import { Injectable, Inject } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { AnalyticsFeatureConfig } from '../../config/domains/features/analytics-feature.config';
import { CacheConfig } from '../../config/domains/cache.config';

@Injectable()
export class AnalyticsVendorPerformanceService {
  constructor(private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly analyticsFeatureConfig: AnalyticsFeatureConfig,
    private readonly cacheConfig: CacheConfig
  ) {}

  async getVendorRankings(shopId: string) {
    const cacheKey = `vendor_rankings:${shopId}`;
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) return cached;

    const rankings = await this.prisma.vendorPerformanceSnapshot.findMany({
      where: { shopId },
      orderBy: { overallScore: 'desc' },
      take: this.analyticsFeatureConfig.topVendorsLimit // Configurable limit
    });

    await this.cacheManager.set(cacheKey, rankings, this.cacheConfig.analyticsVendorPerfTtlMs); // 15 min cache
    return rankings;
  }
}
