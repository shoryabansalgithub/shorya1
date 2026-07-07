import { Injectable, BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

@Injectable()
export class PurchaseReturnValidationService {
  /**
   * Enterprise Return Validation
   * Prevents returning more than received.
   */
  async validateReturnLines(tx: Prisma.TransactionClient, lines: any[]) {
    for (const line of lines) {
      if (!line.grnLineId) {
        throw new BadRequestException('Enterprise Compliance Violation: Purchase Return Line must explicitly reference a valid GRN Line.');
      }

      const grnLine = await tx.goodsReceiptLine.findUnique({
        where: { id: line.grnLineId }
      });

      if (!grnLine) {
        throw new BadRequestException('Matching GRN Line not found for return validation');
      }

      const previouslyReturnedAgg = await tx.purchaseReturnLine.aggregate({
        where: { grnLineId: line.grnLineId },
        _sum: { returnQuantity: true }
      });
      const previouslyReturned = Number(previouslyReturnedAgg._sum.returnQuantity || 0);

      const received = parseFloat(grnLine.acceptedQuantity as any || 0);
      const returning = parseFloat(line.returnQuantity || 0);
      const totalRequestedReturn = returning + previouslyReturned;

      if (totalRequestedReturn > received) {
        throw new BadRequestException(
          `Over-Return Detected: Cannot return quantity (${totalRequestedReturn}) exceeding Accepted GRN quantity (${received}). Previously returned: ${previouslyReturned}.`
        );
      }
    }
  }
}
