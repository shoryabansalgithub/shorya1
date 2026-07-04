import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { OrderValidationEngine } from './order-validation-engine';
import { OrderNumberEngine } from './order-number-engine';
import { SnapshotEngine } from './snapshot-engine';
import { SalesOrderStateMachine } from './sales-order-state-machine';
import { CreateSalesOrderDto } from '../dto/create-sales-order.dto';
import { EventPublisherService } from '../../events-domain/services/event-publisher.service';
import { SalesDomainEventType } from '../interfaces/sales-domain-events';

@Injectable()
export class SalesOrderService {
  private readonly logger = new Logger(SalesOrderService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly validationEngine: OrderValidationEngine,
    private readonly orderNumberEngine: OrderNumberEngine,
    private readonly snapshotEngine: SnapshotEngine,
    private readonly stateMachine: SalesOrderStateMachine,
    private readonly eventPublisher: EventPublisherService
  ) {}

  async createOrder(shopId: string, tenantId: string | undefined, dto: CreateSalesOrderDto, actorId: string) {
    this.logger.log(`Creating Sales Order for shop ${shopId}`);

    // 1. Validate Business Rules
    await this.validationEngine.validateOrder(shopId, dto);

    // 2. Generate Transaction-Safe Order Number
    const orderNumber = await this.orderNumberEngine.generateOrderNumber(shopId);

    // 3. Calculate Financials
    let subTotal = 0;
    let taxTotal = 0;
    let discountTotal = 0;

    for (const line of dto.lines) {
      const lineNet = line.quantity * (line.unitPrice - (line.discount || 0));
      const lineTax = lineNet * ((line.taxRate || 0) / 100);
      
      subTotal += lineNet;
      taxTotal += lineTax;
      discountTotal += (line.discount || 0) * line.quantity;
    }

    const grandTotal = subTotal + taxTotal;

    // 4. Execute Transaction (Outbox Pattern included)
    const result = await this.prisma.$transaction(async (tx) => {
      // Create Core Order
      const order = await tx.salesOrder.create({
        data: {
          shopId,
          tenantId,
          orderNumber,
          customerId: dto.customerId,
          status: 'DRAFT',
          subTotal,
          taxTotal,
          discountTotal,
          grandTotal,
          createdBy: actorId,
          lines: {
            create: dto.lines.map(l => ({
              shopId,
              productId: l.productId,
              variantId: l.variantId,
              sku: null, // Would fetch from product in real scenario
              productName: 'Frozen Name', // Would fetch from product
              quantity: l.quantity,
              unitPrice: l.unitPrice,
              discount: l.discount || 0,
              taxRate: l.taxRate || 0,
              lineTotal: l.quantity * (l.unitPrice - (l.discount || 0))
            }))
          }
        },
        include: { lines: true }
      });

      // Status History
      await tx.salesOrderStatusHistory.create({
        data: {
          orderId: order.id,
          shopId,
          newStatus: 'DRAFT',
          actorId
        }
      });

      // Audit Log
      await tx.salesOrderAudit.create({
        data: {
          orderId: order.id,
          shopId,
          field: 'CREATED',
          actorId
        }
      });

      // Publish Outbox Event
      await this.eventPublisher.publish(
        tx,
        shopId,
        {
          type: SalesDomainEventType.SalesOrderCreated,
          entityType: 'SalesOrder',
          entityId: order.id,
          payload: {
            orderId: order.id,
            orderNumber: order.orderNumber,
            customerId: order.customerId,
            totalAmount: order.grandTotal.toString(),
            lines: order.lines.map(l => ({
              productId: l.productId,
              variantId: l.variantId,
              quantity: l.quantity.toString(),
              unitPrice: l.unitPrice.toString()
            }))
          }
        }
      );

      return order;
    });

    // 5. Asynchronous Snapshotting (Outside TX to keep TX fast, or could be inside)
    for (const line of dto.lines) {
      await this.snapshotEngine.createSnapshot(result.id, shopId, line.productId, line.variantId || null);
    }

    return result;
  }
}
