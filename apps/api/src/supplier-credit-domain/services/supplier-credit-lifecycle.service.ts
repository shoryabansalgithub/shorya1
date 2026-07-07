import { Injectable, BadRequestException } from '@nestjs/common';
import { SupplierCreditStatus, Prisma } from '@prisma/client';

@Injectable()
export class SupplierCreditLifecycleService {
  validateTransition(current: SupplierCreditStatus, target: SupplierCreditStatus) {
    const allowed: Record<SupplierCreditStatus, SupplierCreditStatus[]> = {
      DRAFT: ['SUBMITTED', 'CANCELLED'],
      SUBMITTED: ['PENDING_APPROVAL', 'CANCELLED'],
      PENDING_APPROVAL: ['APPROVED', 'REJECTED'],
      APPROVED: ['ISSUED'],
      ISSUED: ['ALLOCATED', 'CLOSED'], 
      ALLOCATED: ['CLOSED'],
      CLOSED: ['ARCHIVED'],
      REJECTED: ['ARCHIVED', 'DRAFT'],
      CANCELLED: ['ARCHIVED'],
      ARCHIVED: []
    };

    if (!allowed[current]?.includes(target)) {
      throw new BadRequestException(`Invalid Supplier Credit Note transition from ${current} to ${target}`);
    }
  }

  async transitionStatus(
    tx: Prisma.TransactionClient, 
    id: string, 
    shopId: string, 
    currentStatus: SupplierCreditStatus, 
    targetStatus: SupplierCreditStatus, 
    actorId: string, 
    notes?: string
  ) {
    this.validateTransition(currentStatus, targetStatus);
    
    await tx.supplierCreditNote.update({
      where: { id },
      data: { status: targetStatus }
    });

    await tx.supplierCreditStatusHistory.create({
      data: {
        supplierCreditId: id,
        shopId,
        status: targetStatus,
        actorId,
        notes
      }
    });
  }
}
