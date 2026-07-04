import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { BatchStatus } from '@prisma/client';

@Injectable()
export class ExpiryService {
  private readonly logger = new Logger(ExpiryService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Sweeps the database for expired batches and quarantines them.
   * Prevents any further allocation of these batches.
   */
  async quarantineExpiredBatches() {
    this.logger.log('Starting Expiry Sweep...');

    const now = new Date();

    const result = await this.prisma.batch.updateMany({
      where: {
        status: BatchStatus.AVAILABLE,
        expiryDate: { lte: now }
      },
      data: {
        status: BatchStatus.EXPIRED
      }
    });

    if (result.count > 0) {
      this.logger.warn(`Quarantined ${result.count} expired batches.`);
    }

    return result.count;
  }
}
