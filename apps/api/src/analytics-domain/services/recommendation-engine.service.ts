import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RecommendationType } from '@prisma/client';

@Injectable()
export class RecommendationEngineService {
  private readonly logger = new Logger(RecommendationEngineService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Analyzes current KPIs and classifications to generate actionable business advice.
   */
  async generateRecommendations(shopId: string) {
    this.logger.log(`Generating Inventory Recommendations for shop ${shopId}...`);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const kpis = await this.prisma.inventoryKpi.findMany({
      where: { shopId, date: today }
    });

    for (const kpi of kpis) {
      // Rule 1: High Stockout Risk -> REORDER
      if (kpi.stockoutRiskScore.toNumber() > 80) {
        await this.prisma.inventoryRecommendation.create({
          data: {
            shopId,
            productId: kpi.productId,
            type: RecommendationType.REORDER,
            score: kpi.stockoutRiskScore,
            reason: 'High stockout risk based on current holding and demand velocity.',
            actionData: { suggestedQuantity: 100 }
          }
        });
      }

      // Rule 2: High Days of Inventory -> LIQUIDATE (Dead Stock Risk)
      if (kpi.daysOfInventory.toNumber() > 180) {
        await this.prisma.inventoryRecommendation.create({
          data: {
            shopId,
            productId: kpi.productId,
            type: RecommendationType.LIQUIDATE,
            score: 95,
            reason: 'Dead stock risk. Inventory aging beyond 180 days.',
            actionData: { suggestedDiscount: 20 }
          }
        });
      }
    }

    this.logger.log(`Generated recommendations.`);
  }
}
