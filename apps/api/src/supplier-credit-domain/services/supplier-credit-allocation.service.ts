import { Injectable, BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

@Injectable()
export class SupplierCreditAllocationService {
  /**
   * Enterprise Allocation Engine
   * Allocates a portion of a Supplier Credit Note to a specific Vendor Bill.
   * Decrements outstandingAmount on Vendor Bill.
   */
  async processAllocation(tx: Prisma.TransactionClient, shopId: string, creditNote: any, vendorBillId: string, allocationAmount: number) {
    const vendorBill = await tx.vendorBill.findUnique({
      where: { id: vendorBillId, shopId }
    });

    if (!vendorBill) throw new BadRequestException(`Vendor Bill ${vendorBillId} not found for allocation`);

    const remainingCredit = parseFloat(creditNote.remainingBalance as any || 0);
    const outstandingBill = parseFloat(vendorBill.outstandingAmount as any || 0);

    if (allocationAmount > remainingCredit) {
      throw new BadRequestException(`Allocation amount (${allocationAmount}) exceeds remaining credit balance (${remainingCredit})`);
    }

    if (allocationAmount > outstandingBill) {
      throw new BadRequestException(`Allocation amount (${allocationAmount}) exceeds Vendor Bill outstanding balance (${outstandingBill})`);
    }

    // 1. Create Allocation Mapping Record
    await tx.supplierCreditAllocation.create({
      data: {
        shopId,
        supplierCreditId: creditNote.id,
        vendorBillId: vendorBill.id,
        allocatedAmount: allocationAmount,
        notes: `Automated Allocation of ${allocationAmount}`
      }
    });

    // 2. Reduce Vendor Bill Outstanding
    await tx.vendorBill.update({
      where: { id: vendorBillId },
      data: {
        outstandingAmount: { decrement: allocationAmount }
        // Depending on accounting logic, this may also be tracked in paidAmount or a separate allocatedAmount
      }
    });

    // 3. Reduce Credit Note Remaining Balance
    await tx.supplierCreditNote.update({
      where: { id: creditNote.id },
      data: {
        allocatedAmount: { increment: allocationAmount },
        remainingBalance: { decrement: allocationAmount }
      }
    });

    return true;
  }
}
