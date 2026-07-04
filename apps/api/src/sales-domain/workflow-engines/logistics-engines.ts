import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { WorkflowOrchestrator } from './workflow-orchestrator';

@Injectable()
export class WarehouseAllocationEngine {
  constructor(
    private readonly prisma: PrismaService,
    private readonly orchestrator: WorkflowOrchestrator
  ) {}

  /**
   * Automates the allocation of order lines to a specific warehouse.
   */
  async allocate(shopId: string, orderId: string) {
    // Determine the optimal warehouse based on stock (Mocked for isolation)
    const optimalWarehouseId = 'wh_default'; 

    await this.prisma.orderFulfillment.create({
      data: {
        shopId,
        orderId,
        warehouseId: optimalWarehouseId,
        status: 'PENDING'
      }
    });

    await this.orchestrator.transitionState(shopId, orderId, 'PICKING', 'SYSTEM', { reason: 'Automated warehouse allocation' });
  }
}

@Injectable()
export class BackorderEngine {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Generates backorders for items that lack inventory.
   */
  async generateBackorder(shopId: string, orderId: string, productId: string, variantId: string | null, quantityMissing: number) {
    return this.prisma.backorder.create({
      data: {
        shopId,
        orderId,
        productId,
        variantId,
        quantity: quantityMissing,
        status: 'PENDING'
      }
    });
  }
}
