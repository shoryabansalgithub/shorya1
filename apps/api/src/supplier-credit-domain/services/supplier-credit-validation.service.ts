import { Injectable, BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

@Injectable()
export class SupplierCreditValidationService {
  /**
   * Core validation ensuring the references are authentic
   */
  async validateReferences(tx: Prisma.TransactionClient, shopId: string, payload: any) {
    if (payload.vendorBillId) {
      const bill = await tx.vendorBill.findUnique({
        where: { id: payload.vendorBillId, shopId }
      });
      if (!bill) throw new BadRequestException('Referenced Vendor Bill does not exist');
      if (bill.supplierId !== payload.supplierId) throw new BadRequestException('Vendor Bill does not belong to specified supplier');
    }

    if (payload.purchaseReturnId) {
      const pr = await tx.purchaseReturn.findUnique({
        where: { id: payload.purchaseReturnId, shopId }
      });
      if (!pr) throw new BadRequestException('Referenced Purchase Return does not exist');
      if (pr.supplierId !== payload.supplierId) throw new BadRequestException('Purchase Return does not belong to specified supplier');
    }
  }
}
