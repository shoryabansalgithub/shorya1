import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSalesOrderDto } from '../dto/create-sales-order.dto';

@Injectable()
export class OrderValidationEngine {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Validates all lines in a sales order prior to creation.
   * Ensures products exist, belong to the tenant, and are active.
   */
  async validateOrder(shopId: string, dto: CreateSalesOrderDto): Promise<void> {
    if (!dto.lines || dto.lines.length === 0) {
      throw new BadRequestException('Order must contain at least one line item');
    }

    const productIds = dto.lines.map(l => l.productId);

    // Fetch products in bulk for performance
    const products = await this.prisma.product.findMany({
      where: {
        id: { in: productIds },
        shopId
      },
      include: {
        variants: true
      }
    });

    if (products.length !== new Set(productIds).size) {
      throw new NotFoundException('One or more products could not be found or do not belong to this shop');
    }

    for (const line of dto.lines) {
      const product = products.find(p => p.id === line.productId);
      
      if (!product) {
        throw new NotFoundException(`Product ${line.productId} not found`);
      }

      if (product.status !== 'ACTIVE') {
        throw new BadRequestException(`Product ${product.name} is not ACTIVE`);
      }

      if (line.variantId) {
        const variant = product.variants.find(v => v.id === line.variantId);
        if (!variant) {
          throw new NotFoundException(`Variant ${line.variantId} not found for product ${product.id}`);
        }
      }
    }
  }
}
