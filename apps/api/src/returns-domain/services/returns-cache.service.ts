import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

@Injectable()
export class ReturnsCacheService {
  constructor(@Inject(CACHE_MANAGER) private readonly cacheManager: Cache) {}

  async invalidateShopReturns(shopId: string): Promise<void> {
    const anyCache: any = this.cacheManager;
    const store = anyCache.store || (anyCache.stores && anyCache.stores[0]);
    if (store && typeof store.keys === 'function') {
      const keys = await store.keys(`shop:${shopId}:return:*`);
      for (const key of keys) {
        await this.cacheManager.del(key);
      }
    }
  }
}
