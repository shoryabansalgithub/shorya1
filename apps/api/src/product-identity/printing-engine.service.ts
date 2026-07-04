import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BarcodeGeneratorService } from './barcode-generator.service';

@Injectable()
export class PrintingEngineService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly barcodeGenerator: BarcodeGeneratorService,
  ) {}

  /**
   * Generates a virtual PDF or standard print payload for a barcode template.
   */
  async printBarcode(shopId: string, barcodeCode: string, templateId: string, quantity: number, userId: string) {
    if (quantity < 1 || quantity > 1000) {
      throw new BadRequestException('Print quantity must be between 1 and 1000');
    }

    const template = await this.prisma.barcodeTemplate.findUnique({
      where: { id: templateId },
    });

    if (!template || template.shopId !== shopId) {
      throw new NotFoundException('Template not found');
    }

    const barcode = await this.prisma.barcode.findUnique({
      where: { shopId_code: { shopId, code: barcodeCode } },
    });

    if (!barcode) {
      throw new NotFoundException('Barcode not found');
    }

    // Record the print job
    const printJob = await this.prisma.barcodePrintJob.create({
      data: {
        shopId,
        templateId,
        quantity,
        status: 'COMPLETED',
        requestedById: userId,
        completedAt: new Date(),
      },
    });

    // In a real scenario, this would render a PDF using pdfkit or send ZPL to a printer.
    // For now, we simulate success and return a metadata payload.
    return {
      message: `Print job dispatched successfully for ${quantity} labels`,
      jobId: printJob.id,
      simulatedPayload: {
        barcodeFormat: barcode.format,
        code: barcode.code,
        templateType: template.type,
      },
    };
  }
}
