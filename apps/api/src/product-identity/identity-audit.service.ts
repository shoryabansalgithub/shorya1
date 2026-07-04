import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class IdentityAuditService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Records a barcode change in the audit ledger and emits an Outbox Event.
   */
  async recordBarcodeChange(
    shopId: string,
    barcodeId: string,
    oldCode: string | null,
    newCode: string,
    reason: string,
    userId: string,
  ) {
    // We use a transaction to guarantee the outbox event and the history record are atomic
    await this.prisma.$transaction(async (tx) => {
      // 1. Write the immutable audit record
      await tx.barcodeHistory.create({
        data: {
          shopId,
          barcodeId,
          oldCode,
          newCode,
          reason,
          changedById: userId,
        },
      });

      // 2. Dispatch to the transactional outbox
      await tx.outboxEvent.create({
        data: {
          type: 'BarcodeChanged',
          shopId: shopId,
          payload: {
            shopId,
            barcodeId,
            oldCode,
            newCode,
            reason,
            userId,
            timestamp: new Date().toISOString(),
          },
          status: 'PENDING',
        },
      });
    });
  }

  /**
   * Retrieves the immutable history of a specific barcode entity.
   */
  async getBarcodeHistory(shopId: string, barcodeId: string) {
    return this.prisma.barcodeHistory.findMany({
      where: {
        shopId,
        barcodeId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        changedBy: {
          select: { id: true, name: true, email: true },
        },
      },
    });
  }
}
