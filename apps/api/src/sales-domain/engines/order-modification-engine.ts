import { Injectable, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { OrderCalculationEngine } from './order-calculation-engine';
import { CreateSalesOrderDto, CreateSalesOrderLineDto } from '../dto/create-sales-order.dto';

@Injectable()
export class OrderModificationEngine {
  constructor(
    private readonly prisma: PrismaService,
    private readonly calculationEngine: OrderCalculationEngine
  ) {}

  /**
   * Modifies an existing order while enforcing Optimistic Locking via the 'version' field.
   * Throws 409 Conflict if version mismatch is detected.
   */
  async modifyOrderLines(
    shopId: string, 
    orderId: string, 
    expectedVersion: number, 
    newLines: CreateSalesOrderLineDto[]
  ) {
    const order = await this.prisma.salesOrder.findUnique({
      where: { id: orderId }
    });

    if (!order || order.shopId !== shopId) {
      throw new BadRequestException('Order not found');
    }

    if (order.version !== expectedVersion) {
      throw new ConflictException(`Optimistic Locking Failure: Expected version ${expectedVersion}, but found ${order.version}`);
    }

    // Convert newLines into the format expected by CalculationEngine
    const mockDto: CreateSalesOrderDto = {
      customerId: order.customerId ?? undefined,
      lines: newLines
    };

    const financials = this.calculationEngine.calculateFinancials(mockDto);

    return this.prisma.$transaction(async (tx) => {
      // 1. Delete old lines
      await tx.salesOrderLine.deleteMany({
        where: { orderId }
      });

      // 2. Insert new lines
      const linesData = financials.lines.map(l => ({
        orderId,
        shopId,
        productId: l.productId,
        variantId: l.variantId,
        sku: null,
        productName: 'Modified Item', // Would fetch real name via SnapshotEngine in prod
        quantity: l.quantity,
        unitPrice: l.unitPrice,
        discount: l.discount,
        taxRate: l.taxRate,
        lineTotal: l.lineTotal
      }));
      
      await tx.salesOrderLine.createMany({
        data: linesData
      });

      // 3. Update Order Totals and Bump Version atomically
      const updatedOrder = await tx.salesOrder.update({
        where: { id: orderId },
        data: {
          subTotal: financials.subTotal,
          taxTotal: financials.taxTotal,
          cgstTotal: financials.cgstTotal,
          sgstTotal: financials.sgstTotal,
          igstTotal: financials.igstTotal,
          cessTotal: financials.cessTotal,
          discountTotal: financials.discountTotal,
          grandTotal: financials.grandTotal,
          outstandingAmount: financials.grandTotal - Number(order.paidAmount),
          version: { increment: 1 }
        }
      });

      // 4. Record Timeline Event
      await tx.salesOrderTimeline.create({
        data: {
          orderId,
          shopId,
          action: 'Lines Modified',
        }
      });

      return updatedOrder;
    });
  }
}
