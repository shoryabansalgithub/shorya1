import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { BatchStatus, RecallStatus } from '@prisma/client';

@Injectable()
export class RecallService {
  private readonly logger = new Logger(RecallService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Instantly initiates a recall on a specific batch.
   * This immediately quarantines the batch, preventing any further FEFO allocations.
   */
  async initiateRecall(shopId: string, batchId: string, reason: string, initiatedById: string) {
    const batch = await this.prisma.batch.findFirst({
      where: { id: batchId, shopId }
    });

    if (!batch) throw new NotFoundException('Batch not found');

    return this.prisma.$transaction(async (tx) => {
      // 1. Create the permanent Recall audit record
      const recall = await tx.batchRecall.create({
        data: {
          shopId,
          batchId,
          reason,
          status: RecallStatus.ACTIVE,
          initiatedById
        }
      });

      // 2. Quarantine the Batch so FEFO ignores it
      await tx.batch.update({
        where: { id: batchId },
        data: { status: BatchStatus.RECALLED }
      });

      this.logger.error(`🚨 BATCH RECALLED: Batch ${batch.batchNumber} has been instantly quarantined. Reason: ${reason}`);
      
      return recall;
    });
  }
}
