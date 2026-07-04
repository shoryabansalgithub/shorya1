import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

@Injectable()
export class InvoiceCacheService {
  constructor(@Inject(CACHE_MANAGER) private readonly cacheManager: Cache) {}

  async getInvoiceCache(shopId: string, invoiceId: string): Promise<any | null> {
    const key = `shop:${shopId}:invoice:${invoiceId}`;
    return this.cacheManager.get(key);
  }

  async setInvoiceCache(shopId: string, invoiceId: string, payload: any): Promise<void> {
    const key = `shop:${shopId}:invoice:${invoiceId}`;
    await this.cacheManager.set(key, payload, 300000); // 5 mins
  }
}
