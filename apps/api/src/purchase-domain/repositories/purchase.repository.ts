import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PurchaseNumberEngine } from '../services/purchase-number-engine.service';
import { PurchaseLifecycleService } from '../services/purchase-lifecycle.service';
import { PurchaseValidationService } from '../services/purchase-validation.service';
import { PurchaseAuditService } from '../services/purchase-audit.service';
import { SalesEventPublisher } from '../../sales-events-domain/services/sales-event-publisher.service';
import { Prisma, PurchaseOrderStatus } from '@prisma/client';

@Injectable()
export class PurchaseRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly numberEngine: PurchaseNumberEngine,
    private readonly lifecycle: PurchaseLifecycleService,
    private readonly validation: PurchaseValidationService,
    private readonly audit: PurchaseAuditService,
    private readonly eventPublisher: SalesEventPublisher
  ) {}

  /**
   * Creates a new Draft or Submitted Enterprise Purchase Order.
   */
  async createPurchaseOrder(shopId: string, payload: any, actorId: string, ipAddress?: string) {
    const { supplierId, items, ...metadata } = payload;
    
    await this.validation.validateSupplier(shopId, supplierId);
    await this.validation.validateItems(shopId, items);

    return this.prisma.$transaction(async (tx) => {
      const orderNumber = await this.numberEngine.generateNextOrderNumber(tx, shopId, 'PO');
      
      const purchaseOrder = await tx.purchaseOrder.create({
        data: {
          shopId,
          supplierId,
          orderNumber,
          status: 'DRAFT',
          totalAmount: metadata.totalAmount || 0,
          notes: metadata.notes,
          department: metadata.department,
          costCenter: metadata.costCenter,
          priority: metadata.priority,
          expectedDelivery: metadata.expectedDelivery ? new Date(metadata.expectedDelivery) : null,
          deliveryTerms: metadata.deliveryTerms,
          paymentTerms: metadata.paymentTerms,
          currency: metadata.currency || 'USD',
          exchangeRate: metadata.exchangeRate || 1.0,
          remarks: metadata.remarks,
          items: {
            create: items.map((item: any) => ({
              productId: item.productId,
              variantId: item.variantId,
              quantity: item.quantity,
              unit: item.unit,
              unitCost: item.unitCost,
              discount: item.discount || 0,
              cgstAmount: item.cgstAmount || 0,
              sgstAmount: item.sgstAmount || 0,
              igstAmount: item.igstAmount || 0,
              totalCost: item.totalCost,
              hsnSac: item.hsnSac,
            }))
          }
        },
        include: { items: true }
      });

      await this.audit.recordAudit(tx, purchaseOrder.id, shopId, 'CREATED', actorId, null, purchaseOrder, ipAddress);
      
      await this.lifecycle.transitionStatus(tx, purchaseOrder.id, shopId, 'DRAFT', 'DRAFT', actorId, 'Initial PO Creation');

      await this.eventPublisher.publish(tx, shopId, {
        eventType: 'PurchaseCreated',
        aggregateId: purchaseOrder.id,
        aggregateType: 'PurchaseOrder',
        payload: purchaseOrder,
        actorId,
      });

      return purchaseOrder;
    });
  }

  async getPurchaseOrder(shopId: string, id: string) {
    const po = await this.prisma.purchaseOrder.findUnique({
      where: { id },
      include: { items: true, timelines: { orderBy: { createdAt: 'desc' } } }
    });

    if (!po || po.shopId !== shopId || po.isDeleted) {
      throw new NotFoundException(`Purchase Order ${id} not found.`);
    }

    return po;
  }

  async listPurchaseOrders(shopId: string, limit: number = 50, offset: number = 0) {
    return this.prisma.purchaseOrder.findMany({
      where: { shopId, isDeleted: false },
      include: { supplier: true },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset
    });
  }

  async approvePurchaseOrder(shopId: string, id: string, actorId: string, ipAddress?: string) {
    const po = await this.getPurchaseOrder(shopId, id);
    
    return this.prisma.$transaction(async (tx) => {
      await this.lifecycle.transitionStatus(tx, po.id, shopId, po.status, 'APPROVED', actorId, 'Approved by procurement team.');
      
      await this.audit.recordAudit(tx, po.id, shopId, 'STATUS_APPROVED', actorId, po.status, 'APPROVED', ipAddress);

      await this.eventPublisher.publish(tx, shopId, {
        eventType: 'PurchaseApproved',
        aggregateId: po.id,
        aggregateType: 'PurchaseOrder',
        payload: { id: po.id, status: 'APPROVED' },
        actorId,
      });
      
      return tx.purchaseOrder.findUnique({ where: { id: po.id } });
    });
  }
}
