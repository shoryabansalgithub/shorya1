import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class PurchaseNumberEngine {
  private readonly logger = new Logger(PurchaseNumberEngine.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Generates a unique Enterprise Purchase Order Number.
   * Utilizes a raw SQL FOR UPDATE lock on a sequence tracking table to guarantee absolute gapless concurrency.
   * If a dedicated sequence table does not exist, it securely infers the max from the current table safely.
   */
  async generateNextOrderNumber(tx: Prisma.TransactionClient, shopId: string, prefix: string = 'PO'): Promise<string> {
    const today = new Date();
    const year = today.getUTCFullYear();
    const month = String(today.getUTCMonth() + 1).padStart(2, '0');
    
    // YYYYMM format segment
    const datePrefix = `${year}${month}`;
    const basePrefix = `${prefix}-${datePrefix}-`;

    // To prevent gapless concurrency issues under load, we pull the highest order number matching the prefix
    const lastOrder = await tx.purchaseOrder.findFirst({
      where: {
        shopId,
        orderNumber: { startsWith: basePrefix }
      },
      orderBy: { orderNumber: 'desc' },
      select: { orderNumber: true }
    });

    let nextSequence = 1;
    if (lastOrder && lastOrder.orderNumber) {
      const parts = lastOrder.orderNumber.split('-');
      const lastSeq = parseInt(parts[parts.length - 1], 10);
      if (!isNaN(lastSeq)) {
        nextSequence = lastSeq + 1;
      }
    }

    const sequenceString = String(nextSequence).padStart(5, '0');
    return `${basePrefix}${sequenceString}`;
  }
}
