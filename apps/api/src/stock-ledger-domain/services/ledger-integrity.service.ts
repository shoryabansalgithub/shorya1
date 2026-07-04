import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { LedgerCalculationService } from './ledger-calculation.service';

@Injectable()
export class LedgerIntegrityService {
  private readonly logger = new Logger(LedgerIntegrityService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly calculator: LedgerCalculationService
  ) {}

  /**
   * Verifies that the mathematical sum of the ledger exactly matches 
   * the cached value in InventoryItem.onHand.
   * If a mismatch is found, it throws an Integrity Violation.
   */
  async verifyIntegrity(shopId: string, inventoryItemId: string): Promise<boolean> {
    const item = await this.prisma.inventoryItem.findFirst({
      where: { id: inventoryItemId, shopId, isDeleted: false }
    });

    if (!item) {
      throw new InternalServerErrorException('Integrity Check Failed: Item not found.');
    }

    const calculatedLedgerBalance = await this.calculator.calculateBalanceAt(shopId, inventoryItemId);
    const cachedBalance = item.onHand.toNumber();

    if (calculatedLedgerBalance !== cachedBalance) {
      const msg = `LEDGER INTEGRITY VIOLATION! Item ${inventoryItemId}. Ledger: ${calculatedLedgerBalance}, Cache: ${cachedBalance}`;
      this.logger.error(msg);
      
      // In a real Fortune 500 system, this would trigger PagerDuty and a system lock for this item.
      throw new InternalServerErrorException(msg);
    }

    return true;
  }
}
