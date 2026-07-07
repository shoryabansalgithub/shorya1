import { Injectable, Logger, BadRequestException } from '@nestjs/common';

@Injectable()
export class PurchaseTaxService {
  private readonly logger = new Logger(PurchaseTaxService.name);

  /**
   * Calculate taxes based on configuration (inclusive or exclusive).
   */
  calculateTaxes(items: any[], mode: 'INCLUSIVE' | 'EXCLUSIVE', currency: string, exchangeRate: number) {
    this.logger.debug(`Calculating taxes in ${mode} mode`);
    
    return items.map(item => {
      const quantity = item.quantity || 0;
      const unitCost = item.unitCost || 0;
      const discount = item.discount || 0;
      
      const subtotal = (quantity * unitCost) - discount;
      if (subtotal < 0) {
        throw new BadRequestException('Subtotal cannot be negative');
      }

      // Base tax rates
      const cgstRate = item.cgstRate || 0;
      const sgstRate = item.sgstRate || 0;
      const igstRate = item.igstRate || 0;
      const cessRate = item.cessRate || 0;
      
      const totalTaxRate = cgstRate + sgstRate + igstRate + cessRate;

      let taxableValue = subtotal;
      let taxAmount = 0;

      if (mode === 'INCLUSIVE') {
        taxableValue = subtotal / (1 + (totalTaxRate / 100));
        taxAmount = subtotal - taxableValue;
      } else {
        taxAmount = subtotal * (totalTaxRate / 100);
      }

      const totalCost = taxableValue + taxAmount;

      return {
        ...item,
        price: taxableValue,
        tax: taxAmount,
        totalCost: totalCost,
        cgstAmount: mode === 'INCLUSIVE' ? taxableValue * (cgstRate / 100) : subtotal * (cgstRate / 100),
        sgstAmount: mode === 'INCLUSIVE' ? taxableValue * (sgstRate / 100) : subtotal * (sgstRate / 100),
        igstAmount: mode === 'INCLUSIVE' ? taxableValue * (igstRate / 100) : subtotal * (igstRate / 100),
        cessAmount: mode === 'INCLUSIVE' ? taxableValue * (cessRate / 100) : subtotal * (cessRate / 100),
      };
    });
  }
}
