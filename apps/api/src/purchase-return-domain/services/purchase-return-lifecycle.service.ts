import { Injectable, BadRequestException } from '@nestjs/common';
import { PurchaseReturnStatus, Prisma } from '@prisma/client';

@Injectable()
export class PurchaseReturnLifecycleService {
  validateTransition(current: PurchaseReturnStatus, target: PurchaseReturnStatus) {
    const allowed: Record<PurchaseReturnStatus, PurchaseReturnStatus[]> = {
      DRAFT: ['SUBMITTED', 'CANCELLED'],
      SUBMITTED: ['PENDING_APPROVAL', 'CANCELLED'],
      PENDING_APPROVAL: ['APPROVED', 'REJECTED'],
      APPROVED: ['SHIPPED', 'COMPLETED'], // Sometimes physical shipment isn't needed if it's virtual return
      SHIPPED: ['COMPLETED'],
      COMPLETED: [],
      REJECTED: ['ARCHIVED', 'DRAFT'],
      CANCELLED: ['ARCHIVED'],
      ARCHIVED: []
    };

    if (!allowed[current]?.includes(target)) {
      throw new BadRequestException(`Invalid Purchase Return transition from ${current} to ${target}`);
    }
  }

  async transitionStatus(
    tx: Prisma.TransactionClient, 
    id: string, 
    shopId: string, 
    currentStatus: PurchaseReturnStatus, 
    targetStatus: PurchaseReturnStatus, 
    actorId: string, 
    notes?: string
  ) {
    this.validateTransition(currentStatus, targetStatus);
    
    await tx.purchaseReturn.update({
      where: { id },
      data: { status: targetStatus }
    });

    await tx.purchaseReturnStatusHistory.create({
      data: {
        purchaseReturnId: id,
        shopId,
        status: targetStatus,
        actorId,
        notes
      }
    });
  }
}
