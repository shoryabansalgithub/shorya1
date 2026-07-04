import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { BullModule } from '@nestjs/bullmq';
import { StorageModule } from '../storage/storage.module';

import { InvoiceNumberingEngine } from './engines/invoice-numbering-engine';
import { InvoiceValidationEngine } from './engines/invoice-validation-engine';
import { PdfGenerationService } from './services/pdf-generation.service';
import { InvoiceCacheService } from './services/invoice-cache.service';
import { InvoicePdfWorker } from './workers/invoice-pdf.worker';
import { InvoiceController } from './invoice.controller';

@Module({
  imports: [
    PrismaModule,
    StorageModule,
    BullModule.registerQueue({
      name: 'invoice-pdf-queue',
    }),
  ],
  controllers: [InvoiceController],
  providers: [
    InvoiceNumberingEngine,
    InvoiceValidationEngine,
    PdfGenerationService,
    InvoiceCacheService,
    InvoicePdfWorker
  ],
  exports: [InvoiceNumberingEngine]
})
export class InvoiceDomainModule {}
