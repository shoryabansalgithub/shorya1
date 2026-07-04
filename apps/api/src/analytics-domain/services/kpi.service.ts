import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class KpiService {
  private readonly logger = new Logger(KpiService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Calculates KPI snapshots for all products in a shop.
   * Runs totally asynchronously and decoupled from the transactional flow.
   */
  async calculateDailyKpis(shopId: string) {
    this.logger.log(`Starting Daily KPI Calculation for shop ${shopId}...`);
    
    // We only process active products
    const products = await this.prisma.product.findMany({
      where: { shopId, isDeleted: false },
      select: { id: true, priceTiers: true }
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (const product of products) {
      // 1. Calculate Total Value (On Hand * Price)
      // For simplicity in this engine, we grab total onHand across all bins
      const inventoryItems = await this.prisma.inventoryItem.findMany({
        where: { shopId, productId: product.id }
      });

      const totalOnHand = inventoryItems.reduce((acc, item) => acc + item.onHand.toNumber(), 0);
      
      // Determine base price (assume first price tier is standard)
      const basePrice = product.priceTiers.length > 0 ? product.priceTiers[0].price.toNumber() : 0;
      const totalValue = totalOnHand * basePrice;

      // 2. Turnover Rate (Dummy calc for architecture: usually Sales / Avg Inventory)
      // Here we assume turnover is dynamically derived from outbound movements in ledger
      const turnoverRate = 0; // Replace with actual outbound sum calculation

      // 3. Days of Inventory (Total On Hand / Avg Daily Sales)
      const daysOfInventory = totalOnHand > 0 ? 30 : 0; // Placeholder for architecture

      // 4. Stockout Risk Score (0-100)
      const stockoutRiskScore = totalOnHand < 10 ? 90 : 10;

      // Upsert the KPI snapshot for today
      await this.prisma.inventoryKpi.upsert({
        where: {
          shopId_productId_date: {
            shopId,
            productId: product.id,
            date: today
          }
        },
        update: {
          totalValue,
          turnoverRate,
          daysOfInventory,
          stockoutRiskScore
        },
        create: {
          shopId,
          productId: product.id,
          date: today,
          totalValue,
          turnoverRate,
          daysOfInventory,
          stockoutRiskScore
        }
      });
    }

    this.logger.log(`Completed KPI calculations for ${products.length} products.`);
  }
}
