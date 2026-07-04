import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

@Injectable()
export class AnalyticsCacheService {
  constructor(@Inject(CACHE_MANAGER) private readonly cacheManager: Cache) {}

  async setDashboardCache(shopId: string, data: any): Promise<void> {
    await this.cacheManager.set(`shop:${shopId}:analytics:dashboard`, data, 3600 * 1000); // 1 hour TTL
  }

  async getDashboardCache(shopId: string): Promise<any> {
    return await this.cacheManager.get(`shop:${shopId}:analytics:dashboard`);
  }

  async invalidateDashboard(shopId: string): Promise<void> {
    await this.cacheManager.del(`shop:${shopId}:analytics:dashboard`);
  }
}
