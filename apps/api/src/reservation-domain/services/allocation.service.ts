import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma, AllocationStatus } from '@prisma/client';

@Injectable()
export class AllocationService {
  private readonly logger = new Logger(AllocationService.name);

  /**
   * Performs physical stock allocation for a reservation item using a FIFO strategy 
   * (older warehouse locations are exhausted before newer ones).
   * MUST be executed inside a Prisma transaction.
   */
  async allocateStockFifo(
    tx: Prisma.TransactionClient,
    shopId: string,
    reservationItemId: string,
    productId: string,
    variantId: string | null,
    requestedQuantity: number
  ) {
    let remainingToAllocate = requestedQuantity;

    // Fetch available inventory items, sorted by oldest location first (FIFO)
    const inventoryItems = await tx.inventoryItem.findMany({
      where: {
        shopId,
        productId,
        variantId: variantId || null,
        isDeleted: false
      },
      orderBy: { createdAt: 'asc' }
    });

    for (const item of inventoryItems) {
      if (remainingToAllocate <= 0) break;

      const availableAtLocation = item.onHand.toNumber() - item.reserved.toNumber();
      
      if (availableAtLocation > 0) {
        const allocateFromHere = Math.min(availableAtLocation, remainingToAllocate);
        
        // 1. Create the physical allocation lock
        await tx.reservationAllocation.create({
          data: {
            shopId,
            reservationItemId,
            inventoryItemId: item.id,
            allocatedQuantity: allocateFromHere,
            status: AllocationStatus.LOCKED
          }
        });

        // 2. Update the dual-write cache (InventoryItem.reserved)
        await tx.inventoryItem.update({
          where: { id: item.id },
          data: {
            reserved: { increment: allocateFromHere }
          }
        });

        // (We do not emit a StockLedgerEntry here because this is merely a reservation lock, not a final deduction).

        remainingToAllocate -= allocateFromHere;
      }
    }

    if (remainingToAllocate > 0) {
      throw new BadRequestException(`Race condition detected! Could not allocate ${remainingToAllocate} units across physical locations.`);
    }
  }
}
