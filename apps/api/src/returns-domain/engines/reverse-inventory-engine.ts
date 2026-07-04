import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ReverseInventoryEngine {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Pushes returned goods into QUARANTINE. They are NOT directly sellable yet.
   */
  async quarantineReturnedGoods(shopId: string, returnOrderId: string): Promise<void> {
    const returnOrder = await this.prisma.returnOrder.findUnique({
      where: { id: returnOrderId, shopId },
      include: { lines: true }
    });

    if (!returnOrder) return;

    for (const line of returnOrder.lines) {
      // Create a ledger entry moving stock into QUARANTINE status
      // In reality, this would integrate with stock-ledger-domain
      await this.prisma.returnTimeline.create({
        data: {
          returnOrderId,
          shopId,
          status: 'QUARANTINE_LOGGED',
          notes: `Quantity ${line.quantity} of product ${line.productId} moved to quarantine.`
        }
      });
    }
  }
}
