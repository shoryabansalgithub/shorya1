import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { PurchaseOrderStatus, Prisma } from '@prisma/client';

@Injectable()
export class PurchaseLifecycleService {
  private readonly logger = new Logger(PurchaseLifecycleService.name);

  /**
   * Validates if a state transition is permissible under standard procurement rules.
   */
  validateTransition(currentStatus: PurchaseOrderStatus, targetStatus: PurchaseOrderStatus): void {
    const allowedTransitions: Record<PurchaseOrderStatus, PurchaseOrderStatus[]> = {
      DRAFT: ['SUBMITTED', 'CANCELLED'],
      SUBMITTED: ['UNDER_REVIEW', 'REJECTED', 'CANCELLED'],
      UNDER_REVIEW: ['APPROVED', 'REJECTED', 'CANCELLED'],
      APPROVED: ['ORDERED', 'CANCELLED'],
      ORDERED: ['PARTIALLY_RECEIVED', 'RECEIVED', 'CANCELLED'],
      PARTIALLY_RECEIVED: ['RECEIVED', 'CANCELLED'],
      RECEIVED: ['BILLED', 'CLOSED'],
      BILLED: ['CLOSED'],
      REJECTED: ['DRAFT', 'ARCHIVED'],
      CANCELLED: ['ARCHIVED'],
      CLOSED: ['ARCHIVED'],
      ARCHIVED: []
    };

    const allowed = allowedTransitions[currentStatus] || [];
    
    if (!allowed.includes(targetStatus)) {
      throw new BadRequestException(
        `Invalid Purchase Order lifecycle transition from ${currentStatus} to ${targetStatus}`
      );
    }
  }

  /**
   * Transitions the status of a PO and records the timeline history immutably.
   */
  async transitionStatus(
    tx: Prisma.TransactionClient,
    purchaseOrderId: string,
    shopId: string,
    currentStatus: PurchaseOrderStatus,
    targetStatus: PurchaseOrderStatus,
    actorId?: string,
    notes?: string
  ): Promise<void> {
    this.validateTransition(currentStatus, targetStatus);

    await tx.purchaseOrder.update({
      where: { id: purchaseOrderId },
      data: { status: targetStatus }
    });

    await tx.purchaseOrderTimeline.create({
      data: {
        purchaseOrderId,
        shopId,
        status: targetStatus,
        actorId,
        notes
      }
    });

    this.logger.debug(`PurchaseOrder [${purchaseOrderId}] transitioned: ${currentStatus} -> ${targetStatus}`);
  }
}
