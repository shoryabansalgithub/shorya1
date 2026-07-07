import { Injectable, BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

@Injectable()
export class GrnInspectionService {
  async processInspection(
    tx: Prisma.TransactionClient, 
    shopId: string, 
    id: string, 
    payload: any, 
    actorId: string
  ) {
    const { status, checklist, notes, images } = payload;
    
    // Validate status
    if (!['PASS', 'FAIL', 'CONDITIONAL_PASS', 'HOLD', 'REJECT'].includes(status)) {
      throw new BadRequestException('Invalid inspection status.');
    }

    const inspection = await tx.goodsReceiptInspection.create({
      data: {
        goodsReceiptId: id,
        shopId,
        inspectorId: actorId,
        status,
        checklist: checklist || {},
        notes,
        images: images || []
      }
    });

    return inspection;
  }
}
