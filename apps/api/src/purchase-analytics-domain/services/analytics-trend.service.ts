import { Injectable, Inject } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

@Injectable()
export class AnalyticsTrendService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) {}

  async getTrends(shopId: string, periodType: string) {
    const cacheKey = `trends:${shopId}:${periodType}`;
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) return cached;

    const trends = await this.prisma.purchaseTrendSnapshot.findMany({
      where: { shopId, periodType },
      orderBy: { periodStart: 'asc' },
      take: 12
    });

    await this.cacheManager.set(cacheKey, trends, 60000 * 60); // 1 hour cache
    return trends;
  }

  async getCategorySpend(shopId: string) {
    const cacheKey = `category_spend:${shopId}`;
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) return cached;

    const spend = await this.prisma.purchaseCategorySpendSnapshot.findMany({
      where: { shopId },
      orderBy: { totalSpend: 'desc' },
      take: 20
    });

    await this.cacheManager.set(cacheKey, spend, 60000 * 60);
    return spend;
  }
}
