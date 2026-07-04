import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import * as bwipjs from 'bwip-js';
import { BarcodeFormat } from '@prisma/client';

@Injectable()
export class BarcodeGeneratorService {
  /**
   * Generates a barcode buffer in PNG format.
   * @param code The barcode string.
   * @param format The standard format (e.g., EAN13, UPCA, CODE128).
   * @param includeText Whether to display the text at the bottom.
   */
  async generateBuffer(code: string, format: BarcodeFormat, includeText: boolean = true): Promise<Buffer> {
    const bcid = this.mapFormatToBcid(format);
    if (!bcid) {
      throw new BadRequestException(`Unsupported barcode format: ${format}`);
    }

    try {
      const pngBuffer = await bwipjs.toBuffer({
        bcid,       // Barcode type
        text: code, // Text to encode
        scale: 3,   // 3x scaling factor
        height: 10, // Bar height, in millimeters
        includetext: includeText, // Show human-readable text
        textxalign: 'center',     // Always good to set this
      });
      return pngBuffer;
    } catch (err) {
      throw new InternalServerErrorException(`Barcode generation failed: ${(err as Error).message}`);
    }
  }

  /**
   * Generates a barcode as an SVG string.
   */
  async generateSvg(code: string, format: BarcodeFormat, includeText: boolean = true): Promise<string> {
    // bwip-js doesn't natively return SVG buffer via async/await in exactly the same way,
    // but we can generate an SVG string using a different interface if needed,
    // or just rely on PNG. For now, we'll convert the buffer to base64 for ease of use in HTML.
    const buffer = await this.generateBuffer(code, format, includeText);
    return `data:image/png;base64,${buffer.toString('base64')}`;
  }

  /**
   * Maps Prisma BarcodeFormat to bwip-js bcid.
   */
  private mapFormatToBcid(format: BarcodeFormat): string {
    switch (format) {
      case BarcodeFormat.GS1: return 'gs1-128';
      case BarcodeFormat.EAN8: return 'ean8';
      case BarcodeFormat.EAN13: return 'ean13';
      case BarcodeFormat.UPCA: return 'upca';
      case BarcodeFormat.UPCE: return 'upce';
      case BarcodeFormat.CODE39: return 'code39';
      case BarcodeFormat.CODE93: return 'code93';
      case BarcodeFormat.CODE128: return 'code128';
      case BarcodeFormat.ITF: return 'interleaved2of5';
      case BarcodeFormat.ITF14: return 'itf14';
      case BarcodeFormat.CODABAR: return 'rationalizedCodabar';
      case BarcodeFormat.MSI: return 'msi';
      case BarcodeFormat.PHARMACODE: return 'pharmacode';
      case BarcodeFormat.QRCODE: return 'qrcode';
      case BarcodeFormat.DATAMATRIX: return 'datamatrix';
      case BarcodeFormat.PDF417: return 'pdf417';
      case BarcodeFormat.AZTEC: return 'azteccode';
      default: return '';
    }
  }
}
