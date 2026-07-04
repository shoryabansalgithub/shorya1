import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ReservationValidationService {
  private readonly logger = new Logger(ReservationValidationService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Validates if a reservation request can be fulfilled by checking
   * Available = (onHand - reserved) across all locations for this product.
   */
  async validateAvailabilityOrThrow(
    shopId: string, 
    productId: string, 
    variantId: string | null, 
    requestedQuantity: number
  ): Promise<boolean> {
    
    const inventoryItems = await this.prisma.inventoryItem.findMany({
      where: {
        shopId,
        productId,
        variantId: variantId || null,
        isDeleted: false
      }
    });

    let totalAvailable = 0;
    for (const item of inventoryItems) {
      // Available = onHand - reserved (this is cached by Phase 3.2.1 and maintained by Phase 3.2.4)
      totalAvailable += (item.onHand.toNumber() - item.reserved.toNumber());
    }

    if (totalAvailable < requestedQuantity) {
      this.logger.warn(`Oversell Prevented! Requested: ${requestedQuantity}, Available: ${totalAvailable} for Product ${productId}`);
      throw new BadRequestException(
        `Insufficient stock. Requested ${requestedQuantity}, but only ${totalAvailable} available across all locations.`
      );
    }

    return true;
  }
}
