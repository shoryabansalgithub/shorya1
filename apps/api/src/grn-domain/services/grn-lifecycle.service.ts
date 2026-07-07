import { Injectable, BadRequestException } from '@nestjs/common';
import { GoodsReceiptStatus, Prisma } from '@prisma/client';

@Injectable()
export class GrnLifecycleService {
  validateTransition(current: GoodsReceiptStatus, target: GoodsReceiptStatus) {
    const allowed: Record<GoodsReceiptStatus, GoodsReceiptStatus[]> = {
      DRAFT: ['RECEIVING', 'CANCELLED'],
      RECEIVING: ['PARTIALLY_RECEIVED', 'QUALITY_INSPECTION', 'ACCEPTED', 'CANCELLED'],
      PARTIALLY_RECEIVED: ['RECEIVING', 'QUALITY_INSPECTION', 'ACCEPTED', 'CANCELLED'],
      QUALITY_INSPECTION: ['ACCEPTED', 'REJECTED'],
      ACCEPTED: ['COMPLETED'],
      COMPLETED: ['CLOSED'],
      CLOSED: ['ARCHIVED'],
      REJECTED: ['ARCHIVED'],
      CANCELLED: ['ARCHIVED'],
      ARCHIVED: []
    };

    if (!allowed[current]?.includes(target)) {
      throw new BadRequestException(`Invalid GRN transition from ${current} to ${target}`);
    }
  }

  async transitionStatus(
    tx: Prisma.TransactionClient, 
    id: string, 
    shopId: string, 
    currentStatus: GoodsReceiptStatus, 
    targetStatus: GoodsReceiptStatus, 
    actorId: string, 
    notes?: string
  ) {
    this.validateTransition(currentStatus, targetStatus);
    
    await tx.goodsReceipt.update({
      where: { id },
      data: { status: targetStatus }
    });

    await tx.goodsReceiptStatusHistory.create({
      data: {
        goodsReceiptId: id,
        shopId,
        status: targetStatus,
        actorId,
        notes
      }
    });
  }
}
