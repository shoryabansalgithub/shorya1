import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class OrderSplitEngine {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Splits an order into two physical orders for partial fulfillment.
   */
  async splitOrder(shopId: string, originalOrderId: string, linesToExtractIds: string[]) {
    const original = await this.prisma.salesOrder.findUnique({
      where: { id: originalOrderId },
      include: { lines: true }
    });

    if (!original || original.shopId !== shopId) throw new BadRequestException('Order not found');

    const linesToMove = original.lines.filter(l => linesToExtractIds.includes(l.id));
    
    // Create new order clone with -A suffix logic
    return this.prisma.$transaction(async (tx) => {
      const childOrder = await tx.salesOrder.create({
        data: {
          shopId,
          orderNumber: `${original.orderNumber}-A`,
          customerId: original.customerId,
          status: 'DRAFT', // Starts as draft
          subTotal: 0,
          taxTotal: 0,
          discountTotal: 0,
          grandTotal: 0,
          currency: original.currency
        }
      });

      // Move lines (abstracting exact recalculations for brevity)
      for (const line of linesToMove) {
        await tx.salesOrderLine.update({
          where: { id: line.id },
          data: { orderId: childOrder.id }
        });
      }

      await tx.orderSplitHistory.create({
        data: {
          shopId,
          originalOrderId,
          childOrderId: childOrder.id,
          reason: 'Manual Split for partial fulfillment'
        }
      });

      await tx.salesOrder.update({
        where: { id: originalOrderId },
        data: { status: 'SPLIT' }
      });

      return childOrder;
    });
  }
}
