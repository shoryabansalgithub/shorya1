import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { CacheConfig } from '../../config/domains/cache.config';

@Injectable()
export class AnalyticsCacheService {
  constructor(@Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly cacheConfig: CacheConfig
  ) {}

  async setDashboardCache(shopId: string, data: any): Promise<void> {
    await this.cacheManager.set(`shop:${shopId}:analytics:dashboard`, data, this.cacheConfig.analyticsDashboardTtlMs); // 1 hour TTL
  }

  async getDashboardCache(shopId: string): Promise<any> {
    return await this.cacheManager.get(`shop:${shopId}:analytics:dashboard`);
  }

  async invalidateDashboard(shopId: string): Promise<void> {
    await this.cacheManager.del(`shop:${shopId}:analytics:dashboard`);
  }
}
