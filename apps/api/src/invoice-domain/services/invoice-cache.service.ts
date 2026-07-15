import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { CacheConfig } from '../../config/domains/cache.config';

@Injectable()
export class InvoiceCacheService {
  constructor(@Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly cacheConfig: CacheConfig
  ) {}

  async getInvoiceCache(shopId: string, invoiceId: string): Promise<any | null> {
    const key = `shop:${shopId}:invoice:${invoiceId}`;
    return this.cacheManager.get(key);
  }

  async setInvoiceCache(shopId: string, invoiceId: string, payload: any): Promise<void> {
    const key = `shop:${shopId}:invoice:${invoiceId}`;
    await this.cacheManager.set(key, payload, this.cacheConfig.invoiceTtlMs); // 5 mins
  }
}
