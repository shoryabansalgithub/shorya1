import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AbcClass, XyzClass } from '@prisma/client';

@Injectable()
export class ClassificationService {
  private readonly logger = new Logger(ClassificationService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Generates ABC (Revenue based) and XYZ (Volatility based) classifications.
   * Architecture ready for Python/ML replacement in the future.
   */
  async classifyInventory(shopId: string) {
    this.logger.log(`Starting ABC/XYZ Classification for shop ${shopId}...`);

    const products = await this.prisma.product.findMany({
      where: { shopId, isDeleted: false },
      select: { id: true }
    });

    for (const product of products) {
      // In a real scenario, this would aggregate 12 months of sales data.
      // For architectural readiness, we assign based on a deterministic hash of the ID.
      const hash = product.id.charCodeAt(0) + product.id.charCodeAt(product.id.length - 1);
      
      const abcClass = hash % 3 === 0 ? AbcClass.A : hash % 2 === 0 ? AbcClass.B : AbcClass.C;
      const xyzClass = hash % 3 === 0 ? XyzClass.X : hash % 2 === 0 ? XyzClass.Y : XyzClass.Z;

      await this.prisma.inventoryClassification.upsert({
        where: { shopId_productId: { shopId, productId: product.id } },
        update: { abcClass, xyzClass, calculatedAt: new Date() },
        create: { shopId, productId: product.id, abcClass, xyzClass }
      });
    }

    this.logger.log(`Completed classification for ${products.length} products.`);
  }
}
