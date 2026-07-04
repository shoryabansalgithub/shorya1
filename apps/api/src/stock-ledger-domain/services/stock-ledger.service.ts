import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { StockMovementType, Prisma } from '@prisma/client';

@Injectable()
export class StockLedgerService {
  private readonly logger = new Logger(StockLedgerService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Appends an immutable record to the stock ledger. 
   * MUST be executed inside a Prisma transaction (tx) provided by the caller 
   * to guarantee consistency between the Ledger and the InventoryItem cache.
   */
  async recordMovement(
    tx: Prisma.TransactionClient,
    shopId: string,
    inventoryItemId: string,
    params: {
      movementType: StockMovementType;
      quantityChange: number;
      unitCost?: number;
      referenceType?: string;
      referenceId?: string;
      documentId?: string;
      correlationId?: string;
      createdBy: string;
      currentBalance: number; // Balance immediately before this transaction
    }
  ) {
    const balanceAfter = params.currentBalance + params.quantityChange;

    const entry = await tx.stockLedgerEntry.create({
      data: {
        shopId,
        inventoryItemId,
        movementType: params.movementType,
        quantity: params.quantityChange,
        unitCost: params.unitCost,
        referenceType: params.referenceType,
        referenceId: params.referenceId,
        documentId: params.documentId,
        correlationId: params.correlationId,
        balanceAfter,
        createdBy: params.createdBy,
      }
    });

    this.logger.debug(`Ledger Entry [${entry.id}]: Item ${inventoryItemId} moved by ${params.quantityChange}. New Balance: ${balanceAfter}`);

    return entry;
  }
}
