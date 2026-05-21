import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { InventoryGateway } from '../inventory/inventory.gateway';

@Injectable()
export class BillingHelpers {
  constructor(
    private readonly prisma: PrismaService,
    private readonly inventoryGateway: InventoryGateway
  ) {}

  async checkLowStockAlerts(shopId: string, deductions: Array<{productId: string, newStock: number}>) {
    for (const { productId, newStock } of deductions) {
      const product = await this.prisma.product.findUnique({
        where: { id: productId },
        select: { name: true, reorderPoint: true }
      });
      if (product && newStock <= product.reorderPoint.toNumber()) {
        // Create a Notification record
        await this.prisma.notification.create({
          data: {
            shopId,
            type: 'LOW_STOCK',
            title: 'Low Stock Alert',
            message: `"${product.name}" has only ${newStock} unit(s) remaining. Reorder point is ${product.reorderPoint}.`,
            entityId: productId
          }
        });
        // Emit real-time alert via Socket.IO
        this.inventoryGateway.broadcastLowStockAlert(shopId, { productId, productName: product.name, currentStock: newStock });
      }
    }
  }
}
