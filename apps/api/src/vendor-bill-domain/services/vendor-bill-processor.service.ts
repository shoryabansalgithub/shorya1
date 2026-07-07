import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';

import { PrismaService } from '../../prisma/prisma.service';
import { StorageService } from '../../storage/storage.service';
import { DocumentGenerationService } from '../../common/document/document-generation.service';

@Processor('vendor-bills')
export class VendorBillProcessorService extends WorkerHost {
  private readonly logger = new Logger(VendorBillProcessorService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
    private readonly documentService: DocumentGenerationService
  ) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    this.logger.debug(`Processing Vendor Bill job ${job.id} of type ${job.name}`);
    
    switch (job.name) {
      case 'process-ocr':
        return this.handleOCR(job.data);
      case 'generate-payment-advice':
        return this.handlePaymentAdvice(job.data);
      default:
        this.logger.warn(`Unknown job type: ${job.name}`);
    }
  }

  private async handleOCR(data: any) {
    this.logger.log(`Processing scanned invoice via OCR for Vendor Bill ${data.billId}...`);
    await new Promise(resolve => setTimeout(resolve, 2000));
    return { status: 'OCR_COMPLETED' };
  }

  private async handlePaymentAdvice(data: any) {
    this.logger.log(`Generating Payment Advice PDF for Bill ${data.billId}...`);
    
    const buffer = await this.documentService.generateVendorBillPdf(data.billId);
    
    const multerFile = {
      originalname: `Bill-${data.billId}.pdf`,
      buffer,
      mimetype: 'application/pdf',
      size: buffer.length
    } as Express.Multer.File;

    const fileUrl = await this.storageService.uploadFileToCloud(multerFile, 'vendor-bills');

    const bill = await this.prisma.vendorBill.findUnique({ where: { id: data.billId } });
    if (!bill) throw new Error(`Bill ${data.billId} not found`);

    await this.prisma.vendorBillAttachment.create({
      data: {
        vendorBillId: bill.id,
        shopId: bill.shopId,
        fileName: multerFile.originalname,
        fileUrl,
        fileType: 'application/pdf',
        fileSize: buffer.length,
        metadata: { generated: true }
      }
    });

    return { status: 'PDF_GENERATED', url: fileUrl };
  }
}
