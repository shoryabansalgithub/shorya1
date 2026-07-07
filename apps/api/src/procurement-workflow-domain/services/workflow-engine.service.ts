import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { WorkflowBudgetService } from './workflow-budget.service';

@Injectable()
export class WorkflowEngineService {
  private readonly logger = new Logger(WorkflowEngineService.name);

  constructor(private readonly budgetService: WorkflowBudgetService) {}

  /**
   * Spawns a new Workflow Instance based on matching definition conditions.
   */
  async spawnWorkflow(tx: Prisma.TransactionClient, shopId: string, documentType: string, documentId: string, payload: any) {
    this.logger.log(`Attempting to spawn workflow for ${documentType} ID: ${documentId}`);
    
    // Find highest version active definition for this document type
    const defs = await tx.workflowDefinition.findMany({
      where: { shopId, documentType, isActive: true },
      include: { steps: { orderBy: { stepOrder: 'asc' } } },
      orderBy: { version: 'desc' }
    });

    if (defs.length === 0) {
      this.logger.log(`No active workflow definitions found for ${documentType}`);
      return null;
    }

    // In a real enterprise engine, we evaluate `def.conditions` (JSON expression) against `payload`
    // to pick the exact matching definition. For MVP, we pick the first one.
    const definition = defs[0];

    if (documentType === 'PURCHASE_ORDER' && payload?.totalAmount) {
      const conditions = definition.conditions as any;
      if (conditions && conditions.budgetLimit) {
        await this.budgetService.validateDocumentBudget(tx, shopId, payload.department, Number(payload.totalAmount), Number(conditions.budgetLimit));
      }
    }

    const instanceData: any = {
      shopId,
      workflowDefinitionId: definition.id,
      status: 'ACTIVE',
      currentStepOrder: 1,
      startedBy: 'SYSTEM'
    };

    // Bind Document
    if (documentType === 'PURCHASE_ORDER') instanceData.purchaseOrderId = documentId;
    if (documentType === 'VENDOR_BILL') instanceData.vendorBillId = documentId;
    if (documentType === 'GRN') instanceData.goodsReceiptId = documentId;
    if (documentType === 'PURCHASE_RETURN') instanceData.purchaseReturnId = documentId;
    if (documentType === 'SUPPLIER_CREDIT') instanceData.supplierCreditId = documentId;

    const instance = await tx.workflowInstance.create({
      data: instanceData
    });

    // Spawn first step tasks
    await this.spawnTasksForStep(tx, shopId, instance.id, definition.steps, 1);

    await tx.workflowTimeline.create({
      data: {
        workflowInstanceId: instance.id,
        shopId,
        action: 'WORKFLOW_STARTED',
        notes: `Workflow spawned from definition: ${definition.name}`
      }
    });

    return instance;
  }

  async spawnTasksForStep(tx: Prisma.TransactionClient, shopId: string, instanceId: string, steps: any[], stepOrder: number) {
    const activeSteps = steps.filter(s => s.stepOrder === stepOrder);
    
    if (activeSteps.length === 0) return;

    for (const step of activeSteps) {
      // Create WorkflowTask
      await tx.workflowTask.create({
        data: {
          workflowInstanceId: instanceId,
          shopId,
          stepOrder: step.stepOrder,
          assignedRoleId: step.approverRole,
          assignedUserId: step.approverId,
          departmentId: step.departmentId,
          status: 'PENDING',
          deadline: step.slaMinutes ? new Date(Date.now() + step.slaMinutes * 60000) : null
        }
      });
    }
  }
}
