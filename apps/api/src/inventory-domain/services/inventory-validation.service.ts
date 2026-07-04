import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TenantContextService } from '../../iam/tenant-context/tenant-context.service';

@Injectable()
export class InventoryValidationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantContext: TenantContextService,
  ) {}

  /**
   * Validates that a product exists and belongs to the current tenant before
   * creating an inventory item.
   */
  async validateProductOwnership(productId: string): Promise<void> {
    const shopId = this.tenantContext.getShopId();
    const product = await this.prisma.product.findFirst({
      where: { id: productId, shopId, isDeleted: false },
      select: { id: true },
    });
    if (!product) {
      throw new BadRequestException(`Product ${productId} not found or does not belong to this shop.`);
    }
  }

  /**
   * Validates that an adjustment won't cause integer overflow 
   * or exceed maximum stock limits.
   */
  validateAdjustmentBounds(currentOnHand: number, change: number, maxStock: number): void {
    const newValue = currentOnHand + change;
    if (newValue > maxStock) {
      throw new BadRequestException(
        `Adjustment would exceed maximum stock limit. Max: ${maxStock}, Result: ${newValue}`
      );
    }
    // Protect against floating point precision (Decimal128 safe range)
    if (Math.abs(newValue) > 999999999.999) {
      throw new BadRequestException('Stock value exceeds safe precision range.');
    }
  }
}
