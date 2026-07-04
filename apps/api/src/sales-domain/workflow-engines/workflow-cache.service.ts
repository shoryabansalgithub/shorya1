import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

@Injectable()
export class WorkflowCacheService {
  constructor(@Inject(CACHE_MANAGER) private readonly cacheManager: Cache) {}

  async getWorkflowState(shopId: string, orderId: string): Promise<any | null> {
    const key = `shop:${shopId}:workflow:${orderId}`;
    return this.cacheManager.get(key);
  }

  async setWorkflowState(shopId: string, orderId: string, payload: any): Promise<void> {
    const key = `shop:${shopId}:workflow:${orderId}`;
    await this.cacheManager.set(key, payload, 300000); // 5 mins
  }
}
