import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { PrismaService } from '../../prisma/prisma.service';
import { StorageService } from '../../storage/storage.service';
import { DocumentGenerationService } from '../../common/document/document-generation.service';

@Processor('grn-jobs')
export class GrnProcessorService extends WorkerHost {
  private readonly logger = new Logger(GrnProcessorService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
    private readonly documentService: DocumentGenerationService
  ) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    this.logger.debug(`Processing GRN job ${job.id} of type ${job.name}`);
    
    switch (job.name) {
      case 'generate-barcode':
        return this.handleBarcodeGeneration(job.data);
      case 'process-attachment':
        return this.handleAttachment(job.data);
      case 'generate-pdf':
        return this.handlePdfGeneration(job.data);
      default:
        this.logger.warn(`Unknown job type: ${job.name}`);
    }
  }

  private async handlePdfGeneration(data: { grnId: string }) {
    this.logger.log(`Generating GRN PDF for ${data.grnId}...`);
    
    const buffer = await this.documentService.generateGrnPdf(data.grnId);
    
    const multerFile = {
      originalname: `GRN-${data.grnId}.pdf`,
      buffer,
      mimetype: 'application/pdf',
      size: buffer.length
    } as Express.Multer.File;

    const fileUrl = await this.storageService.uploadFileToCloud(multerFile, 'grns');

    const grn = await this.prisma.goodsReceipt.findUnique({ where: { id: data.grnId } });
    if (!grn) throw new Error(`GRN ${data.grnId} not found`);

    await this.prisma.goodsReceiptAttachment.create({
      data: {
        goodsReceiptId: grn.id,
        shopId: grn.shopId,
        fileName: multerFile.originalname,
        fileUrl,
        fileType: 'application/pdf',
        fileSize: buffer.length,
        metadata: { generated: true }
      }
    });

    return { status: 'PDF_GENERATED', url: fileUrl };
  }

  private async handleBarcodeGeneration(data: any) {
    this.logger.log(`Generating Barcodes for GRN ${data.grnId}...`);
    await new Promise(resolve => setTimeout(resolve, 1500));
    return { status: 'GENERATED' };
  }

  private async handleAttachment(data: any) {
    this.logger.log(`Processing attachment ${data.attachmentId}...`);
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { status: 'PROCESSED' };
  }
}
