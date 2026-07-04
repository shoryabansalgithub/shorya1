import { Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class Gs1EngineService {
  /**
   * Calculates the Modulo 10 check digit for GS1 barcodes (EAN-13, EAN-8, UPC-A).
   * @param payload The barcode string without the check digit.
   */
  calculateCheckDigit(payload: string): number {
    if (!/^\d+$/.test(payload)) {
      throw new BadRequestException('GS1 payload must contain only digits');
    }

    let sum = 0;
    // For EAN-13 (12 digits payload) / UPC-A (11 digits payload), we iterate right to left.
    // The multiplier alternates between 3 and 1 starting from the rightmost digit.
    for (let i = payload.length - 1, multiplier = 3; i >= 0; i--) {
      sum += parseInt(payload[i], 10) * multiplier;
      multiplier = multiplier === 3 ? 1 : 3;
    }

    const remainder = sum % 10;
    return remainder === 0 ? 0 : 10 - remainder;
  }

  /**
   * Validates a complete GS1 barcode including its check digit.
   */
  validate(barcode: string): boolean {
    if (!/^\d{8,14}$/.test(barcode)) return false; // Basic length check for standard GS1 formats
    const payload = barcode.slice(0, -1);
    const expectedCheckDigit = parseInt(barcode.slice(-1), 10);
    return this.calculateCheckDigit(payload) === expectedCheckDigit;
  }

  /**
   * Identifies the probable GS1 format based on length.
   */
  identifyFormat(barcode: string): 'EAN13' | 'EAN8' | 'UPCA' | 'UNKNOWN' {
    const length = barcode.length;
    if (length === 13) return 'EAN13';
    if (length === 12) return 'UPCA';
    if (length === 8) return 'EAN8';
    return 'UNKNOWN';
  }
}
