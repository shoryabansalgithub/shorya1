import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import Decimal from 'decimal.js';

@Injectable()
export class RevenueEngine {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Retrieves current day revenue metrics from the materialized table.
   */
  async getTodayRevenue(shopId: string) {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const agg = await this.prisma.dailySalesAggregation.findUnique({
      where: { shopId_date: { shopId, date: today } }
    });

    if (!agg) {
      return {
        grossRevenue: 0,
        netRevenue: 0,
        totalRefunds: 0
      };
    }

    return {
      grossRevenue: agg.grossRevenue.toNumber(),
      netRevenue: agg.netRevenue.toNumber(),
      totalRefunds: agg.totalRefunds.toNumber(),
    };
  }

  /**
   * Calculates total aggregated revenue over a custom date range.
   */
  async getRevenueDateRange(shopId: string, startDate: Date, endDate: Date) {
    const aggregations = await this.prisma.dailySalesAggregation.findMany({
      where: {
        shopId,
        date: { gte: startDate, lte: endDate }
      }
    });

    return aggregations.reduce((acc, curr) => {
      acc.grossRevenue += curr.grossRevenue.toNumber();
      acc.netRevenue += curr.netRevenue.toNumber();
      acc.totalRefunds += curr.totalRefunds.toNumber();
      return acc;
    }, { grossRevenue: 0, netRevenue: 0, totalRefunds: 0 });
  }
}
