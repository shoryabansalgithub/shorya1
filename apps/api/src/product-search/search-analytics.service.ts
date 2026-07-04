import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SearchAnalyticsService {
  private readonly logger = new Logger(SearchAnalyticsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Logs a search execution for analytics and history.
   */
  async logSearch(shopId: string, userId: string | null, query: string, resultCount: number, durationMs: number) {
    // 1. Log to history
    await this.prisma.searchHistory.create({
      data: {
        shopId,
        userId,
        query,
        resultCount,
        durationMs
      }
    });

    // 2. We can optionally emit an event here for async aggregation 
    // or rely on a cron job to aggregate `SearchHistory` into `SearchAnalytics`.
  }

  /**
   * Retrieves popular trending searches.
   */
  async getPopularSearches(shopId: string) {
    // Basic aggregation: most frequent queries in the last 7 days
    const popular = await this.prisma.searchHistory.groupBy({
      by: ['query'],
      where: {
        shopId,
        createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
      },
      _count: { query: true },
      orderBy: { _count: { query: 'desc' } },
      take: 10
    });

    return popular.map(p => ({
      query: p.query,
      count: p._count.query
    }));
  }
}
