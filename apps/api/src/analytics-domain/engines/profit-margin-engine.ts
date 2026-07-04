import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import Decimal from 'decimal.js';

@Injectable()
export class ProfitMarginEngine {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Calculates Gross Profit Margin % and Net Margin %.
   * Gross Margin % = (Gross Profit / Net Revenue) * 100
   */
  calculateMargins(grossProfit: number, netRevenue: number) {
    if (netRevenue <= 0) return { grossMarginPct: 0 };
    return {
      grossMarginPct: Number(((grossProfit / netRevenue) * 100).toFixed(2))
    };
  }

  /**
   * Evaluates top performing products based on profit.
   */
  async getTopProductsByProfit(shopId: string, limit: number = 10) {
    const products = await this.prisma.productSalesAggregation.findMany({
      where: { shopId },
      orderBy: { netRevenue: 'desc' },
      take: limit,
      include: { product: true }
    });

    return products.map(p => {
      const gp = p.netRevenue.toNumber() - p.totalCogs.toNumber();
      return {
        productId: p.productId,
        name: p.product.name,
        grossProfit: gp,
        ...this.calculateMargins(gp, p.netRevenue.toNumber())
      };
    });
  }
}
