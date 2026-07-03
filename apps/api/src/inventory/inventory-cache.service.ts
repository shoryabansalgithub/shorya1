import { Injectable, Inject, Logger } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { PrismaService } from '../prisma/prisma.service';
import { TenantContextService } from '../iam/tenant-context/tenant-context.service';

@Injectable()
export class InventoryCacheService {
  private readonly logger = new Logger(InventoryCacheService.name);
  private redis: any = null;

  constructor(
    @Inject(CACHE_MANAGER) private cache: Cache,
    private prisma: PrismaService,
    private readonly tenantContext: TenantContextService,
  ) {
    // Safely attempt to access the underlying Redis client.
    // Falls back to null if the cache store is not Redis (e.g., in-memory).
    try {
      const cacheAny = this.cache as any;
      const store = cacheAny.store || cacheAny.stores?.[0];
      if (store?.client) {
        this.redis = store.client;
        this.logger.log('Redis client connected for inventory cache');
      } else {
        this.logger.warn(
          'No Redis client available — inventory cache will use DB-only path',
        );
      }
    } catch {
      this.logger.warn('Failed to access Redis client from cache store');
    }
  }

  // Warm the cache on startup (load all product stocks into Redis)
  async warmCache(): Promise<void> {
    if (!this.redis) return;
    const shopId = this.tenantContext.getShopId();
    const products = await this.prisma.product.findMany({
      where: { shopId, isDeleted: false },
      select: { id: true, currentStock: true },
    });
    const pipeline = this.redis.pipeline();
    for (const p of products) {
      pipeline.set(
        `stock:${shopId}:${p.id}`,
        p.currentStock.toNumber().toString(),
        'EX',
        3600,
      ); // 1 hour TTL
    }
    await pipeline.exec();
  }

  // Atomic pre-decrement in Redis (BEFORE the DB transaction)
  // Returns: 'ok' | 'insufficient' | 'cache_miss'
  async tryDecrementStock(
    productId: string,
    quantity: number,
  ): Promise<'ok' | 'insufficient' | 'cache_miss'> {
    if (!this.redis) return 'cache_miss';
    const shopId = this.tenantContext.getShopId();
    const key = `stock:${shopId}:${productId}`;
    const exists = await this.redis.exists(key);
    if (!exists) return 'cache_miss'; // Fall back to DB-only path

    // Lua script for atomic check-and-decrement (float-safe)
    // Uses GET/SET with float arithmetic instead of integer-only DECRBY
    const luaScript = `
      local current = tonumber(redis.call('GET', KEYS[1]))
      if current == nil then return '-2' end
      local qty = tonumber(ARGV[1])
      if current < qty then return '-1' end
      local newVal = current - qty
      redis.call('SET', KEYS[1], tostring(newVal))
      return tostring(newVal)
    `;
    const result = await this.redis.eval(
      luaScript,
      1,
      key,
      quantity.toString(),
    );

    if (result === '-1') return 'insufficient';
    if (result === '-2') return 'cache_miss';
    return 'ok';
  }

  // Called after DB transaction rolls back — restore the Redis counter
  async restoreStock(
    productId: string,
    quantity: number,
  ): Promise<void> {
    if (!this.redis) return;
    const shopId = this.tenantContext.getShopId();
    const key = `stock:${shopId}:${productId}`;
    await this.redis.incrbyfloat(key, quantity); // Support fractional
  }

  // Called when stock is manually adjusted — keep Redis in sync
  async syncStock(
    productId: string,
    newStock: number,
  ): Promise<void> {
    if (!this.redis) return;
    const shopId = this.tenantContext.getShopId();
    await this.redis.set(`stock:${shopId}:${productId}`, newStock.toString(), 'EX', 3600);
  }
}
