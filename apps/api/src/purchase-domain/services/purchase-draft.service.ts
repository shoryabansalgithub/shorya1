import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PurchaseAuditService } from './purchase-audit.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class PurchaseDraftService {
  private readonly logger = new Logger(PurchaseDraftService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: PurchaseAuditService
  ) {}

  async saveDraft(
    tx: Prisma.TransactionClient,
    shopId: string,
    purchaseOrderId: string,
    updates: any,
    actorId: string
  ) {
    this.logger.debug(`Saving draft for PO ${purchaseOrderId}`);
    
    // Process main updates
    const { items, ...poUpdates } = updates;

    const currentPo = await tx.purchaseOrder.findUnique({ where: { id: purchaseOrderId } });
    if (!currentPo || currentPo.shopId !== shopId) {
      throw new Error('Purchase Order not found.');
    }

    if (currentPo.status !== 'DRAFT') {
      throw new Error('Can only modify Purchase Orders in DRAFT status.');
    }

    const updatedPo = await tx.purchaseOrder.update({
      where: { id: purchaseOrderId },
      data: {
        ...poUpdates,
        revisionNumber: currentPo.revisionNumber + 1
      },
      include: { items: true }
    });

    // Handle item updates (simplified, full implementation would diff items)
    if (items && Array.isArray(items)) {
      await tx.purchaseOrderItem.deleteMany({
        where: { purchaseOrderId }
      });
      await tx.purchaseOrderItem.createMany({
        data: items.map(item => ({
          purchaseOrderId,
          productId: item.productId,
          variantId: item.variantId,
          quantity: item.quantity,
          unitCost: item.unitCost,
          totalCost: item.totalCost,
          price: item.price || 0,
          tax: item.tax || 0,
          cessAmount: item.cessAmount || 0,
          warehouseId: item.warehouseId,
          binId: item.binId,
          expectedDate: item.expectedDate ? new Date(item.expectedDate) : null,
          remarks: item.remarks
        }))
      });
    }

    // Save revision snapshot
    const snapshotData = await tx.purchaseOrder.findUnique({
      where: { id: purchaseOrderId },
      include: { items: true }
    });

    await tx.purchaseOrderRevision.create({
      data: {
        purchaseOrderId,
        shopId,
        revisionNumber: updatedPo.revisionNumber,
        snapshotData: snapshotData as any,
        createdBy: actorId,
        commitMessage: 'Draft autosave'
      }
    });

    await this.audit.recordAudit(tx, purchaseOrderId, shopId, 'DRAFT_UPDATED', actorId, currentPo as any, updatedPo as any, undefined);

    return updatedPo;
  }
}
