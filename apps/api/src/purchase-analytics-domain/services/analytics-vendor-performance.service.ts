import { Injectable, Inject } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

@Injectable()
export class AnalyticsVendorPerformanceService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) {}

  async getVendorRankings(shopId: string) {
    const cacheKey = `vendor_rankings:${shopId}`;
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) return cached;

    const rankings = await this.prisma.vendorPerformanceSnapshot.findMany({
      where: { shopId },
      orderBy: { overallScore: 'desc' },
      take: 50 // Top 50 vendors
    });

    await this.cacheManager.set(cacheKey, rankings, 60000 * 15); // 15 min cache
    return rankings;
  }
}
