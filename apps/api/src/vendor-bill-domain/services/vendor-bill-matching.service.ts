import { Injectable, BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

@Injectable()
export class VendorBillMatchingService {
  /**
   * Enterprise Three-Way Matching Engine
   * Validates: PO Quantity >= GRN Quantity >= Billed Quantity
   */
  async enforceThreeWayMatch(
    tx: Prisma.TransactionClient, 
    shopId: string, 
    vendorBillLines: any[], 
    tolerancePercentage: number = 0
  ) {
    for (const billLine of vendorBillLines) {
      if (!billLine.purchaseOrderLineId || !billLine.grnLineId) continue;

      const poLine = await tx.purchaseOrderItem.findUnique({
        where: { id: billLine.purchaseOrderLineId }
      });
      
      const grnLine = await tx.goodsReceiptLine.findUnique({
        where: { id: billLine.grnLineId }
      });

      if (!poLine || !grnLine) {
        throw new BadRequestException('Matching documents not found for Three-Way match');
      }

      const ordered = parseFloat(poLine.quantity as any || 0);
      const received = parseFloat(grnLine.acceptedQuantity as any || 0);
      const billed = parseFloat(billLine.billedQuantity || 0);

      // Rule 1: Cannot bill more than what was accepted in GRN (plus tolerance)
      const maxAllowedBill = received * (1 + (tolerancePercentage / 100));
      
      if (billed > maxAllowedBill) {
        throw new BadRequestException(
          `Three-Way Match Failed: Billed quantity (${billed}) exceeds Received quantity (${received})`
        );
      }

      // Rule 2: GRN quantity should ideally match PO quantity, but that's GRN's job. 
      // Vendor Bill just checks it against PO for audit safety.
      if (billed > ordered * (1 + (tolerancePercentage / 100))) {
         throw new BadRequestException(
          `Three-Way Match Failed: Billed quantity (${billed}) exceeds Ordered quantity (${ordered})`
        );
      }
    }
  }
}
