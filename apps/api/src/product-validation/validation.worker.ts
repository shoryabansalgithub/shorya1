import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger, Injectable } from '@nestjs/common';
import { ProductValidationService } from './product-validation.service';

@Processor('product-validation')
@Injectable()
export class ValidationWorker extends WorkerHost {
  private readonly logger = new Logger(ValidationWorker.name);

  constructor(
    private readonly validationService: ProductValidationService
  ) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    switch (job.name) {
      case 'validate-product':
        return this.handleValidateProduct(job.data);
      case 'bulk-validate':
        return this.handleBulkValidate(job.data);
      default:
        this.logger.warn(`Unknown job name: ${job.name}`);
    }
  }

  private async handleValidateProduct(data: { shopId: string, productId: string }) {
    this.logger.log(`Background validation for product ${data.productId}`);
    await this.validationService.executeValidation(data.shopId, data.productId);
  }

  private async handleBulkValidate(data: { shopId: string, productIds: string[] }) {
    this.logger.log(`Bulk validation for ${data.productIds.length} products`);
    for (const id of data.productIds) {
      try {
        await this.validationService.executeValidation(data.shopId, id);
      } catch (err) {
        this.logger.error(`Failed bulk validation for ${id}: ${(err as Error).message}`);
      }
    }
  }
}
