import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class PurchaseReturnReplacementService {
  private readonly logger = new Logger(PurchaseReturnReplacementService.name);

  async processReplacement(returnId: string) {
    this.logger.log(`Processing Replacement flow for ${returnId}`);
    // Handled virtually for now
  }
}
