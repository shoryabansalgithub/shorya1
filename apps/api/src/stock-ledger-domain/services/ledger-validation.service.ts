import { Injectable, BadRequestException } from '@nestjs/common';
import { StockMovementType } from '@prisma/client';

@Injectable()
export class LedgerValidationService {
  /**
   * Validates if a movement type is permitted to result in negative stock.
   */
  validateNegativeStockAllowance(movementType: StockMovementType, resultingBalance: number, isNegativeAllowed: boolean) {
    if (resultingBalance < 0 && !isNegativeAllowed) {
      throw new BadRequestException(
        `Movement ${movementType} would result in negative stock (${resultingBalance}). This is prohibited for this item.`
      );
    }
  }

  /**
   * Validates if the movement configuration makes sense.
   * E.g. A Purchase should generally be positive, a Sale should be negative.
   */
  validateMovementDirection(movementType: StockMovementType, quantity: number) {
    const shouldBePositive: StockMovementType[] = [StockMovementType.PURCHASE, StockMovementType.TRANSFER_IN, StockMovementType.SALE_RETURN];
    const shouldBeNegative: StockMovementType[] = [StockMovementType.SALE, StockMovementType.TRANSFER_OUT, StockMovementType.DAMAGE, StockMovementType.LOSS];

    if (shouldBePositive.includes(movementType) && quantity < 0) {
      throw new BadRequestException(`${movementType} must have a positive quantity.`);
    }

    if (shouldBeNegative.includes(movementType) && quantity > 0) {
      throw new BadRequestException(`${movementType} must have a negative quantity.`);
    }
  }
}
