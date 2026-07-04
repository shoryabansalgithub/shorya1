import { Injectable, BadRequestException } from '@nestjs/common';
import { SalesOrderStatus } from '@prisma/client';

@Injectable()
export class SalesOrderStateMachine {
  
  // Valid transitions mapped as { [CurrentState]: [Allowed Next States] }
  private readonly validTransitions: Record<SalesOrderStatus, SalesOrderStatus[]> = {
    [SalesOrderStatus.DRAFT]: [SalesOrderStatus.PENDING_CONFIRMATION, SalesOrderStatus.CANCELLED],
    [SalesOrderStatus.PENDING_CONFIRMATION]: [SalesOrderStatus.CONFIRMED, SalesOrderStatus.REJECTED, SalesOrderStatus.CANCELLED],
    [SalesOrderStatus.CONFIRMED]: [SalesOrderStatus.RESERVED, SalesOrderStatus.CANCELLED, SalesOrderStatus.ON_HOLD],
    [SalesOrderStatus.RESERVED]: [SalesOrderStatus.READY_FOR_BILLING, SalesOrderStatus.PICKING, SalesOrderStatus.CANCELLED, SalesOrderStatus.ON_HOLD],
    [SalesOrderStatus.PICKING]: [SalesOrderStatus.PICKED, SalesOrderStatus.ON_HOLD, SalesOrderStatus.CANCELLED],
    [SalesOrderStatus.PICKED]: [SalesOrderStatus.PACKING, SalesOrderStatus.ON_HOLD, SalesOrderStatus.CANCELLED],
    [SalesOrderStatus.PACKING]: [SalesOrderStatus.PACKED, SalesOrderStatus.ON_HOLD, SalesOrderStatus.CANCELLED],
    [SalesOrderStatus.PACKED]: [SalesOrderStatus.READY_TO_SHIP, SalesOrderStatus.ON_HOLD, SalesOrderStatus.CANCELLED],
    [SalesOrderStatus.READY_TO_SHIP]: [SalesOrderStatus.SHIPPED, SalesOrderStatus.ON_HOLD, SalesOrderStatus.CANCELLED],
    [SalesOrderStatus.SHIPPED]: [SalesOrderStatus.DELIVERED, SalesOrderStatus.RETURNED_PENDING, SalesOrderStatus.FAILED],
    [SalesOrderStatus.READY_FOR_BILLING]: [SalesOrderStatus.PARTIALLY_BILLED, SalesOrderStatus.BILLED, SalesOrderStatus.ON_HOLD],
    [SalesOrderStatus.PARTIALLY_BILLED]: [SalesOrderStatus.BILLED, SalesOrderStatus.ON_HOLD],
    [SalesOrderStatus.BILLED]: [SalesOrderStatus.PARTIALLY_DELIVERED, SalesOrderStatus.DELIVERED],
    [SalesOrderStatus.PARTIALLY_DELIVERED]: [SalesOrderStatus.DELIVERED],
    [SalesOrderStatus.DELIVERED]: [SalesOrderStatus.COMPLETED, SalesOrderStatus.RETURNED_PENDING],
    [SalesOrderStatus.COMPLETED]: [SalesOrderStatus.ARCHIVED],
    [SalesOrderStatus.CANCELLED]: [SalesOrderStatus.ARCHIVED],
    [SalesOrderStatus.PARTIALLY_CANCELLED]: [SalesOrderStatus.ARCHIVED],
    [SalesOrderStatus.ON_HOLD]: [
      SalesOrderStatus.CONFIRMED, 
      SalesOrderStatus.RESERVED, 
      SalesOrderStatus.PICKING,
      SalesOrderStatus.READY_FOR_BILLING,
      SalesOrderStatus.PARTIALLY_BILLED,
      SalesOrderStatus.CANCELLED
    ],
    [SalesOrderStatus.REJECTED]: [SalesOrderStatus.ARCHIVED],
    [SalesOrderStatus.EXPIRED]: [SalesOrderStatus.ARCHIVED],
    [SalesOrderStatus.ARCHIVED]: [], // Terminal state
    [SalesOrderStatus.FAILED]: [SalesOrderStatus.ARCHIVED],
    [SalesOrderStatus.RETURNED_PENDING]: [SalesOrderStatus.CANCELLED, SalesOrderStatus.COMPLETED],
    [SalesOrderStatus.SPLIT]: [SalesOrderStatus.ARCHIVED],
  };

  /**
   * Enforces the lifecycle of a Sales Order.
   * Throws an exception if the transition is invalid.
   */
  validateTransition(currentStatus: SalesOrderStatus, nextStatus: SalesOrderStatus): void {
    if (currentStatus === nextStatus) {
      return; // Noop
    }

    const allowedNextStates = this.validTransitions[currentStatus] || [];
    if (!allowedNextStates.includes(nextStatus)) {
      throw new BadRequestException(
        `Invalid Order State Transition: Cannot move from ${currentStatus} to ${nextStatus}`
      );
    }
  }
}
