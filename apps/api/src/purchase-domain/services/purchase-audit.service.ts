import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

@Injectable()
export class PurchaseAuditService {
  /**
   * Injects an immutable audit log entry into the database transaction.
   */
  async recordAudit(
    tx: Prisma.TransactionClient,
    purchaseOrderId: string,
    shopId: string,
    action: string,
    actorId?: string,
    previousPayload?: any,
    newPayload?: any,
    ipAddress?: string
  ): Promise<void> {
    await tx.purchaseOrderAudit.create({
      data: {
        purchaseOrderId,
        shopId,
        action,
        actorId,
        previousPayload,
        newPayload,
        ipAddress
      }
    });
  }
}
