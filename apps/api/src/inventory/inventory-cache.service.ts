import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { PrismaService } from '../prisma/prisma.service';
import Redis from 'ioredis';

@Injectable()
export class InventoryCacheService {
  private redis: Redis;

  constructor(
    @Inject(CACHE_MANAGER) private cache: Cache,
    private prisma: PrismaService
  ) {
    // Assuming the underlying store exposes the redis client
    // @ts-ignore
    this.redis = this.cache.store.client;
  }

  // Warm the cache on startup (load all product stocks into Redis)
  async warmCache(shopId: string): Promise<void> {
    if (!this.redis) return;
    const products = await this.prisma.product.findMany({
      where: { shopId, isDeleted: false },
      select: { id: true, currentStock: true }
    });
    const pipeline = this.redis.pipeline();
    for (const p of products) {
      pipeline.set(`stock:${shopId}:${p.id}`, p.currentStock.toNumber(), 'EX', 3600); // 1 hour TTL
    }
    await pipeline.exec();
  }

  // Atomic pre-decrement in Redis (BEFORE the DB transaction)
  // Returns: 'ok' | 'insufficient' | 'cache_miss'
  async tryDecrementStock(shopId: string, productId: string, quantity: number): Promise<'ok' | 'insufficient' | 'cache_miss'> {
    if (!this.redis) return 'cache_miss';
    const key = `stock:${shopId}:${productId}`;
    const exists = await this.redis.exists(key);
    if (!exists) return 'cache_miss'; // Fall back to DB-only path

    // Lua script for atomic check-and-decrement
    // This runs as a single atomic operation in Redis
    const luaScript = `
      local current = tonumber(redis.call('GET', KEYS[1]))
      if current == nil then return -2 end
      if current < tonumber(ARGV[1]) then return -1 end
      return redis.call('DECRBY', KEYS[1], ARGV[1])
    `;
    const result = await this.redis.eval(luaScript, 1, key, quantity.toString());

    if (result === -1) return 'insufficient';
    if (result === -2) return 'cache_miss';
    return 'ok';
  }

  // Called after DB transaction rolls back — restore the Redis counter
  async restoreStock(shopId: string, productId: string, quantity: number): Promise<void> {
    if (!this.redis) return;
    const key = `stock:${shopId}:${productId}`;
    await this.redis.incrbyfloat(key, quantity); // Support fractional
  }

  // Called when stock is manually adjusted — keep Redis in sync
  async syncStock(shopId: string, productId: string, newStock: number): Promise<void> {
    if (!this.redis) return;
    await this.redis.set(`stock:${shopId}:${productId}`, newStock, 'EX', 3600);
  }
}
