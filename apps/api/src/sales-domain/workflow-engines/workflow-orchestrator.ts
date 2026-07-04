import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SalesOrderStatus } from '@prisma/client';
import { EventPublisherService } from '../../events-domain/services/event-publisher.service';

@Injectable()
export class WorkflowOrchestrator {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventPublisher: EventPublisherService
  ) {}

  /**
   * Central orchestrator for all state transitions.
   * Enforces rules and publishes strongly typed domain events.
   */
  async transitionState(shopId: string, orderId: string, newState: SalesOrderStatus, actorId?: string, metadata?: any) {
    return this.prisma.$transaction(async (tx) => {
      const order = await tx.salesOrder.findUnique({ where: { id: orderId } });
      if (!order || order.shopId !== shopId) throw new BadRequestException('Order not found');

      // (In real scenario, check StateMachine matrix here for validity)

      const updatedOrder = await tx.salesOrder.update({
        where: { id: orderId },
        data: { 
          status: newState,
          version: { increment: 1 } 
        }
      });

      // Record Timeline
      await tx.salesOrderTimeline.create({
        data: {
          orderId,
          shopId,
          action: `Status transitioned to ${newState}`,
          actorId,
          metadata
        }
      });

      // Record History
      await tx.salesOrderStatusHistory.create({
        data: {
          orderId,
          shopId,
          previousStatus: order.status,
          newStatus: newState,
          actorId,
          reason: metadata?.reason || 'Workflow Transition'
        }
      });

      // Outbox Event
      await this.eventPublisher.publish(
        tx,
        shopId,
        {
          type: 'WorkflowStateChanged',
          entityType: 'SalesOrder',
          entityId: order.id,
          payload: {
            orderId: order.id,
            previousStatus: order.status,
            newStatus: newState
          }
        }
      );

      return updatedOrder;
    });
  }
}
