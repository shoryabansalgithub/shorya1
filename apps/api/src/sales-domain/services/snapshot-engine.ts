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

  async createSnapshotsBulk(orderId: string, shopId: string, lines: {productId: string, variantId?: string | null}[], tx?: any): Promise<void> {
    const db = tx || this.prisma;
    const productIds = lines.map(l => l.productId);
    const variantIds = lines.map(l => l.variantId).filter(Boolean) as string[];

    const products = await db.product.findMany({
      where: { id: { in: productIds }, shopId }
    });
    
    let variants: any[] = [];
    if (variantIds.length > 0) {
      variants = await db.productVariant.findMany({
        where: { id: { in: variantIds } }
      });
    }

    const productMap = new Map<string, any>(products.map((p: any) => [p.id, p]));
    const variantMap = new Map<string, any>(variants.map((v: any) => [v.id, v]));

    const snapshotData = lines.map(line => {
      const product = productMap.get(line.productId);
      if (!product) return null;

      const variant = line.variantId ? variantMap.get(line.variantId) : null;

      return {
        orderId,
        shopId,
        entityType: 'PRODUCT',
        entityId: line.productId,
        frozenData: {
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
        }
      };
    }).filter(Boolean) as any[];

    if (snapshotData.length > 0) {
      await db.salesOrderSnapshot.createMany({
        data: snapshotData
      });
    }
  }
}
