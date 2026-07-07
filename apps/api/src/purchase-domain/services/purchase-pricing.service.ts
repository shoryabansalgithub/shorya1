import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class PurchasePricingService {
  private readonly logger = new Logger(PurchasePricingService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Stores an immutable snapshot of the PO pricing when approved.
   */
  async createSnapshot(tx: Prisma.TransactionClient, shopId: string, purchaseOrderId: string) {
    this.logger.debug(`Creating pricing snapshot for PO ${purchaseOrderId}`);
    
    const po = await tx.purchaseOrder.findUnique({
      where: { id: purchaseOrderId },
      include: { items: true, supplier: true }
    });

    if (!po) return null;

    const existing = await tx.purchasePricingSnapshot.findUnique({
      where: { purchaseOrderId }
    });

    if (existing) {
      this.logger.debug(`Pricing snapshot already exists for PO ${purchaseOrderId}`);
      return existing;
    }

    return tx.purchasePricingSnapshot.create({
      data: {
        purchaseOrderId,
        shopId,
        snapshotData: po as any
      }
    });
  }
}
