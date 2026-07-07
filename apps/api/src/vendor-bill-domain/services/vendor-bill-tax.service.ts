import { Injectable } from '@nestjs/common';

@Injectable()
export class VendorBillTaxService {
  /**
   * Prepares tax breakdowns for accounting layer.
   * Assumes standard percentage based breakdown for enterprise tax liability.
   */
  prepareTaxLiability(lines: any[], taxMode: 'INCLUSIVE' | 'EXCLUSIVE') {
    let totalTax = 0;
    let totalBase = 0;

    for (const line of lines) {
      const qty = parseFloat(line.billedQuantity || 0);
      const price = parseFloat(line.unitPrice || 0);
      const taxRate = parseFloat(line.taxPercentage || 0) / 100;
      
      if (taxMode === 'EXCLUSIVE') {
        const base = qty * price;
        const tax = base * taxRate;
        line.taxAmount = tax;
        line.totalAmount = base + tax;
        totalBase += base;
        totalTax += tax;
      } else {
        const total = qty * price;
        const base = total / (1 + taxRate);
        const tax = total - base;
        line.taxAmount = tax;
        line.totalAmount = total;
        totalBase += base;
        totalTax += tax;
      }
    }

    return { totalBase, totalTax, updatedLines: lines };
  }
}
