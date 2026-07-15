import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { CacheConfig } from '../../config/domains/cache.config';

@Injectable()
export class SalesOrderCacheService {
  constructor(@Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly cacheConfig: CacheConfig
  ) {}

  /**
   * Caches recently accessed order details for blazing fast retrieval.
   */
  async getOrderDetails(shopId: string, orderId: string): Promise<any | null> {
    const key = `shop:${shopId}:order:${orderId}`;
    return this.cacheManager.get(key);
  }

  async setOrderDetails(shopId: string, orderId: string, payload: any): Promise<void> {
    const key = `shop:${shopId}:order:${orderId}`;
    // Cache expires in 15 minutes (900000 ms) to prevent stale data
    await this.cacheManager.set(key, payload, this.cacheConfig.salesOrderTtlMs);
  }

  /**
   * Invalidates order cache when modifications happen.
   */
  async invalidateOrder(shopId: string, orderId: string): Promise<void> {
    const key = `shop:${shopId}:order:${orderId}`;
    await this.cacheManager.del(key);
  }
}
