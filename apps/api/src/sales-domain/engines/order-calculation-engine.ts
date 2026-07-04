import { Injectable } from '@nestjs/common';
import { CreateSalesOrderDto } from '../dto/create-sales-order.dto';
import { Prisma } from '@prisma/client';

export interface OrderFinancials {
  subTotal: number;
  discountTotal: number;
  taxTotal: number;
  cgstTotal: number;
  sgstTotal: number;
  igstTotal: number;
  cessTotal: number;
  grandTotal: number;
  lines: Array<{
    productId: string;
    variantId?: string;
    quantity: number;
    unitPrice: number;
    discount: number;
    taxRate: number;
    lineTotal: number;
  }>;
}

@Injectable()
export class OrderCalculationEngine {
  
  /**
   * Deterministically calculates all order financials based on the lines provided.
   * By default, it splits the tax into CGST and SGST equally if the tax rate is provided without specific breakdowns.
   */
  calculateFinancials(dto: CreateSalesOrderDto): OrderFinancials {
    let subTotal = 0;
    let discountTotal = 0;
    let taxTotal = 0;
    let cgstTotal = 0;
    let sgstTotal = 0;
    let igstTotal = 0;
    let cessTotal = 0;

    const processedLines = dto.lines.map(line => {
      const discountAmount = line.discount || 0;
      const netUnitPrice = line.unitPrice - discountAmount;
      const lineNetTotal = netUnitPrice * line.quantity;
      
      const taxRate = line.taxRate || 0;
      const lineTaxTotal = lineNetTotal * (taxRate / 100);
      
      // Default Enterprise Rule: Split tax equally into CGST and SGST for standard transactions
      const cgst = lineTaxTotal / 2;
      const sgst = lineTaxTotal / 2;

      subTotal += lineNetTotal;
      discountTotal += discountAmount * line.quantity;
      taxTotal += lineTaxTotal;
      cgstTotal += cgst;
      sgstTotal += sgst;

      return {
        productId: line.productId,
        variantId: line.variantId,
        quantity: line.quantity,
        unitPrice: line.unitPrice,
        discount: discountAmount,
        taxRate: taxRate,
        lineTotal: lineNetTotal
      };
    });

    const grandTotal = subTotal + taxTotal;

    return {
      subTotal: this.round(subTotal),
      discountTotal: this.round(discountTotal),
      taxTotal: this.round(taxTotal),
      cgstTotal: this.round(cgstTotal),
      sgstTotal: this.round(sgstTotal),
      igstTotal: this.round(igstTotal),
      cessTotal: this.round(cessTotal),
      grandTotal: this.round(grandTotal),
      lines: processedLines
    };
  }

  private round(value: number): number {
    return Math.round((value + Number.EPSILON) * 10000) / 10000;
  }
}
