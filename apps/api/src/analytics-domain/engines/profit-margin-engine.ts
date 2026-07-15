import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import Decimal from 'decimal.js';

import { AnalyticsFeatureConfig } from '../../config/domains/features/analytics-feature.config';

@Injectable()
export class ProfitMarginEngine {
  constructor(
    private readonly prisma: PrismaService,
    private readonly analyticsConfig: AnalyticsFeatureConfig
  ) {}

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
  async getTopProductsByProfit(shopId: string, limit?: number) {
    const finalLimit = limit ?? this.analyticsConfig.topProductsLimit;
    const products = await this.prisma.productSalesAggregation.findMany({
      where: { shopId },
      orderBy: { netRevenue: 'desc' },
      take: finalLimit,
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
