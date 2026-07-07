import { Injectable, Inject } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

@Injectable()
export class EventsStatisticsService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) {}

  async getDashboardMetrics(shopId: string) {
    const cacheKey = `events_metrics:${shopId}`;
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) return cached;

    // Simulate metrics
    const metrics = {
      totalPublished: 1250,
      totalDelivered: 1248,
      totalFailed: 2,
      dlqSize: await this.prisma.purchaseDeadLetter.count({ where: { shopId, status: 'ACTIVE' } })
    };

    await this.cacheManager.set(cacheKey, metrics, 60000); 
    return metrics;
  }
}
