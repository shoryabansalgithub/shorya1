import { Injectable } from '@nestjs/common';

/**
 * Pure calculation functions for inventory quantities.
 * No side effects. No database access. Stateless.
 */
@Injectable()
export class InventoryCalculationService {

  /**
   * Available = OnHand - Reserved - Allocated - Damaged - Lost
   */
  calculateAvailableStock(onHand: number, reserved: number, allocated: number, damaged: number, lost: number): number {
    return onHand - reserved - allocated - damaged - lost;
  }

  /**
   * Determines if a reorder is needed based on current stock and reorder point.
   */
  isReorderNeeded(onHand: number, reserved: number, reorderPoint: number): boolean {
    const effectiveStock = onHand - reserved;
    return effectiveStock <= reorderPoint;
  }

  /**
   * Calculates the optimal reorder quantity considering safety stock.
   */
  calculateReorderQuantity(
    onHand: number,
    reserved: number,
    maxStock: number,
    safetyStock: number,
    reorderQty: number
  ): number {
    const effectiveStock = onHand - reserved;
    const deficit = maxStock - effectiveStock;
    // At minimum, order the configured reorder quantity or the deficit, whichever is larger
    return Math.max(reorderQty, deficit + safetyStock);
  }

  /**
   * Calculates inventory health score (0-100).
   */
  calculateHealthScore(params: {
    negativeItems: number;
    lowStockItems: number;
    totalItems: number;
  }): number {
    if (params.totalItems === 0) return 100;
    const negPenalty = params.negativeItems * 20;
    const lowPenalty = params.lowStockItems * 5;
    return Math.max(0, 100 - negPenalty - lowPenalty);
  }
}
