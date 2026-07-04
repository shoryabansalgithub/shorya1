import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SnapshotEngine {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Freezes product and pricing data at the exact moment of order creation.
   * This ensures historical orders remain perfectly intact even if the master product changes.
   */
  async createSnapshot(orderId: string, shopId: string, productId: string, variantId: string | null): Promise<void> {
    
    // Fetch current state
    const product = await this.prisma.product.findUnique({
      where: { id: productId }
    });

    if (!product || product.shopId !== shopId) {
      return; // Validation engine should catch this, but just in case
    }

    let variant = null;
    if (variantId) {
      variant = await this.prisma.productVariant.findUnique({
        where: { id: variantId }
      });
    }

    // Combine and freeze
    const frozenData = {
      product: {
        id: product.id,
        name: product.name,
        type: product.type,
        sellingPrice: product.sellingPrice,
      },
      variant: variant ? {
        id: variant.id,
        sku: variant.sku,
        sellingPrice: variant.sellingPrice
      } : null
    };

    await this.prisma.salesOrderSnapshot.create({
      data: {
        orderId,
        shopId,
        entityType: 'PRODUCT',
        entityId: productId,
        frozenData
      }
    });
  }
}
