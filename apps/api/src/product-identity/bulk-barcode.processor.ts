import { Process, Processor } from '@nestjs/bull';
import type { Job } from 'bull';
import { ProductIdentityService } from './product-identity.service';
import { BarcodeFormat } from '@prisma/client';
import { Logger } from '@nestjs/common';

export interface BulkBarcodeJobData {
  shopId: string;
  userId: string;
  items: {
    code: string;
    format: BarcodeFormat;
    productId?: string;
    variantId?: string;
    packageId?: string;
  }[];
}

@Processor('barcode-bulk')
export class BulkBarcodeProcessor {
  private readonly logger = new Logger(BulkBarcodeProcessor.name);

  constructor(private readonly productIdentityService: ProductIdentityService) {}

  @Process('generate-batch')
  async handleGenerateBatch(job: Job<BulkBarcodeJobData>) {
    this.logger.log(`Starting bulk generation for ${job.data.items.length} items (Shop: ${job.data.shopId})`);
    
    const { shopId, userId, items } = job.data;
    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      try {
        await this.productIdentityService.generateBarcode({
          shopId,
          code: item.code,
          format: item.format,
          productId: item.productId,
          variantId: item.variantId,
          packageId: item.packageId,
          userId,
        });
        successCount++;
      } catch (err) {
        this.logger.error(`Failed to generate barcode ${item.code}: ${(err as Error).message}`);
        failCount++;
      }

      // Update progress every 10 items
      if (i % 10 === 0) {
        await job.progress(Math.floor((i / items.length) * 100));
      }
    }

    await job.progress(100);
    this.logger.log(`Bulk generation complete. Success: ${successCount}, Failed: ${failCount}`);
    
    return { successCount, failCount };
  }
}
