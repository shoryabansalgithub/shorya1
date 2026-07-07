import { Injectable } from '@nestjs/common';

@Injectable()
export class GrnVarianceService {
  /**
   * Calculates pending and variance quantities for GRN lines.
   */
  calculateVariances(lines: any[]) {
    return lines.map(line => {
      const ordered = parseFloat(line.orderedQuantity || 0);
      const received = parseFloat(line.receivedQuantity || 0);
      const accepted = parseFloat(line.acceptedQuantity || 0);
      const rejected = parseFloat(line.rejectedQuantity || 0);
      const damaged = parseFloat(line.damagedQuantity || 0);
      
      const pending = ordered - accepted;
      
      return {
        ...line,
        orderedQuantity: ordered,
        receivedQuantity: received,
        acceptedQuantity: accepted,
        rejectedQuantity: rejected,
        damagedQuantity: damaged,
        pendingQuantity: pending < 0 ? 0 : pending,
        isOverReceipt: received > ordered,
        isUnderReceipt: received < ordered
      };
    });
  }
}
