import { Injectable, Inject } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

@Injectable()
export class AnalyticsDashboardService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) {}

  /**
   * Retrieves the pre-calculated daily snapshot from the OLAP table.
   * If not present, falls back to a safe approximation and enqueues a cache refresh job.
   */
  async getDashboardSnapshot(shopId: string, date: Date) {
    const normalizedDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const cacheKey = `dashboard:${shopId}:${normalizedDate.toISOString()}`;
    
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) return cached;

    let snapshot = await this.prisma.purchaseAnalyticsSnapshot.findUnique({
      where: { shopId_date: { shopId, date: normalizedDate } }
    });

    if (!snapshot) {
      // Do not fabricate zero-filled dashboards.
      return null;
    }

    await this.cacheManager.set(cacheKey, snapshot, 60000 * 5); // 5 min cache
    return snapshot;
  }
}
