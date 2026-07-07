import { Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class VendorBillOutstandingService {
  /**
   * Dynamically tracks outstanding limits against partial payments.
   */
  processPayment(totalAmount: number, currentPaid: number, paymentAmount: number) {
    const outstanding = totalAmount - currentPaid;

    if (paymentAmount > outstanding) {
      throw new BadRequestException(`Payment amount ${paymentAmount} exceeds outstanding balance ${outstanding}`);
    }

    const newPaidAmount = currentPaid + paymentAmount;
    const newOutstanding = totalAmount - newPaidAmount;

    return {
      paidAmount: newPaidAmount,
      outstandingAmount: newOutstanding,
      isFullyPaid: newOutstanding <= 0
    };
  }
}
