import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { StockLedgerService } from '../../stock-ledger-domain/services/stock-ledger.service';
import { AdjustmentStatus, StockMovementType, Prisma } from '@prisma/client';

@Injectable()
export class AdjustmentPostingService {
  private readonly logger = new Logger(AdjustmentPostingService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly stockLedger: StockLedgerService
  ) {}

  /**
   * Securely posts an approved adjustment to the Stock Ledger.
   * This is the ONLY legitimate way to bypass standard transactional flows and edit stock.
   */
  async postApprovedAdjustment(shopId: string, adjustmentId: string, postedByUserId: string) {
    const adjustment = await this.prisma.adjustmentRequest.findFirst({
      where: { id: adjustmentId, shopId, status: AdjustmentStatus.APPROVED },
      include: { inventoryItem: true }
    });

    if (!adjustment) throw new BadRequestException('Adjustment request not found or not approved.');

    return this.prisma.$transaction(async (tx) => {
      const quantityDelta = adjustment.requestedQuantityDelta.toNumber();
      
      // 1. Post to Immutable Ledger
      const ledgerEntry = await this.stockLedger.recordMovement(tx, shopId, adjustment.inventoryItemId, {
        movementType: StockMovementType.CORRECTION,
        quantityChange: quantityDelta,
        referenceType: 'ADJUSTMENT_REQUEST',
        referenceId: adjustment.id,
        createdBy: postedByUserId,
        currentBalance: adjustment.inventoryItem.onHand.toNumber()
      });

      // 2. Update the Epic 2 Dual-Write Caches
      await tx.inventoryItem.update({
        where: { id: adjustment.inventoryItemId },
        data: { onHand: { increment: quantityDelta } }
      });

      // Maintain legacy Product.currentStock
      await tx.product.update({
        where: { id: adjustment.inventoryItem.productId },
        data: { currentStock: { increment: quantityDelta } }
      });

      // 3. Mark Adjustment as Posted
      await tx.adjustmentRequest.update({
        where: { id: adjustment.id },
        data: { 
          status: AdjustmentStatus.POSTED,
          ledgerEntryId: ledgerEntry.id
        }
      });

      this.logger.log(`Posted Adjustment ${adjustment.id}. Ledger Entry created: ${ledgerEntry.id}.`);
      
      return ledgerEntry;
    });
  }
}
