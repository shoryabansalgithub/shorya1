import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class TrendEngine {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Formats daily aggregations into chart-ready timeseries data arrays.
   */
  async getDailyRevenueTrend(shopId: string, days: number = 30) {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setUTCHours(0, 0, 0, 0);
    endDate.setUTCHours(0, 0, 0, 0);

    const aggregations = await this.prisma.dailySalesAggregation.findMany({
      where: {
        shopId,
        date: { gte: startDate, lte: endDate }
      },
      orderBy: { date: 'asc' }
    });

    return {
      labels: aggregations.map(a => a.date.toISOString().split('T')[0]),
      data: aggregations.map(a => a.netRevenue.toNumber())
    };
  }
}
