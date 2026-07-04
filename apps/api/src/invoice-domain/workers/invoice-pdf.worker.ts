import { Injectable, Logger } from '@nestjs/common';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { PrismaService } from '../../prisma/prisma.service';
import { PdfGenerationService } from '../services/pdf-generation.service';

@Injectable()
@Processor('invoice-pdf-queue')
export class InvoicePdfWorker extends WorkerHost {
  private readonly logger = new Logger(InvoicePdfWorker.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly pdfService: PdfGenerationService
  ) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    this.logger.log(`Processing invoice PDF generation job ${job.id}`);

    const { shopId, invoiceId } = job.data;

    const invoice = await this.prisma.enterpriseInvoice.findUnique({
      where: { id: invoiceId },
      include: { lines: true, taxes: true }
    });

    if (!invoice) return;

    // Generate PDF
    const pdfUrl = await this.pdfService.generateAndUpload(invoiceId, shopId, invoice);

    // Update DB with URL
    await this.prisma.enterpriseInvoice.update({
      where: { id: invoiceId },
      data: { pdfUrl }
    });

    this.logger.log(`PDF generation complete for ${invoice.invoiceNumber}`);
  }
}
