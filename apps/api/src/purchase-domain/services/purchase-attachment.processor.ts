import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { PrismaService } from '../../prisma/prisma.service';

import { StorageService } from '../../storage/storage.service';
import { DocumentGenerationService } from '../../common/document/document-generation.service';
import { ProcurementFeatureConfig } from '../../config/domains/features/procurement-feature.config';

@Processor('purchase-attachments')
export class PurchaseAttachmentProcessor extends WorkerHost {
  private readonly logger = new Logger(PurchaseAttachmentProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
    private readonly documentService: DocumentGenerationService,
    private readonly procurementConfig: ProcurementFeatureConfig
  ) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    this.logger.debug(`Processing attachment job ${job.id} of type ${job.name}`);
    
    switch (job.name) {
      case 'scan-virus':
        return this.handleVirusScan(job.data);
      case 'generate-pdf':
        return this.handlePdfGeneration(job.data);
      default:
        this.logger.warn(`Unknown job type: ${job.name}`);
    }
  }

  private async handleVirusScan(data: { attachmentId: string }) {
    this.logger.log(`Scanning attachment ${data.attachmentId} for viruses...`);
    
    // Simulate virus scan delay
    await new Promise(resolve => setTimeout(resolve, this.procurementConfig.purchaseAttachmentProcessorDelayMs));
    
    // Update status to CLEAN
    await this.prisma.purchaseOrderAttachment.update({
      where: { id: data.attachmentId },
      data: { virusScanStatus: 'CLEAN' }
    });

    this.logger.log(`Attachment ${data.attachmentId} marked as CLEAN.`);
    return { status: 'CLEAN' };
  }

  private async handlePdfGeneration(data: { purchaseOrderId: string }) {
    this.logger.log(`Generating PDF for PO ${data.purchaseOrderId}...`);
    
    // Generate real PDF
    const buffer = await this.documentService.generatePurchaseOrderPdf(data.purchaseOrderId);
    
    // Create mock Multer file for StorageService
    const multerFile = {
      originalname: `PO-${data.purchaseOrderId}.pdf`,
      buffer,
      mimetype: 'application/pdf',
      size: buffer.length
    } as Express.Multer.File;

    // Upload to real storage
    const fileUrl = await this.storageService.uploadFileToCloud(multerFile, 'purchase-orders');

    const po = await this.prisma.purchaseOrder.findUnique({ where: { id: data.purchaseOrderId } });
    if (!po) throw new Error(`PO ${data.purchaseOrderId} not found`);

    // Persist attachment metadata
    await this.prisma.purchaseOrderAttachment.create({
      data: {
        purchaseOrderId: po.id,
        shopId: po.shopId,
        fileName: multerFile.originalname,
        fileUrl,
        fileType: 'application/pdf',
        fileSize: buffer.length,
        virusScanStatus: 'CLEAN',
        metadata: { generated: true }
      }
    });

    this.logger.log(`PDF generated and stored for PO ${data.purchaseOrderId}`);
    return { url: fileUrl };
  }
}
