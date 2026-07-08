import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CustomerSearchService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache
  ) {}

  async search(shopId: string, query: string, skip: number = 0, take: number = 20) {
    const cacheKey = `customer_search:${shopId}:${query}:${skip}:${take}`;
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) return cached;

    const results = await this.prisma.customer.findMany({
      where: {
        shopId,
        isDeleted: false,
        OR: [
          { name: { contains: query } },
          { phone: { contains: query } },
          { email: { contains: query } },
          { profile: { companyName: { contains: query } } },
          { profile: { gstin: { contains: query } } }
        ]
      },
      include: {
        profile: true,
        customerTags: { include: { tag: true } }
      },
      skip,
      take,
      orderBy: { createdAt: 'desc' }
    });

    await this.cacheManager.set(cacheKey, results, 60000); // 60s cache
    return results;
  }
}
