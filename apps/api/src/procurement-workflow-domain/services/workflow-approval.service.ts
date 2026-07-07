import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { WorkflowEngineService } from './workflow-engine.service';

@Injectable()
export class WorkflowApprovalService {
  private readonly logger = new Logger(WorkflowApprovalService.name);

  constructor(private readonly engine: WorkflowEngineService) {}

  /**
   * Evaluates if all tasks for the current step are approved, and moves to the next step if true.
   */
  async evaluateWorkflowState(tx: Prisma.TransactionClient, shopId: string, instanceId: string, actorId: string) {
    const instance = await tx.workflowInstance.findUnique({
      where: { id: instanceId },
      include: {
        workflowDefinition: { include: { steps: true } },
        tasks: { where: { stepOrder: undefined } } // We need all tasks to evaluate
      }
    });

    if (!instance) return;
    
    // Get all tasks for the current step
    const currentTasks = await tx.workflowTask.findMany({
      where: { workflowInstanceId: instanceId, stepOrder: instance.currentStepOrder }
    });

    const anyRejected = currentTasks.some(t => t.status === 'REJECTED');
    const allApproved = currentTasks.every(t => t.status === 'APPROVED');

    if (anyRejected) {
      await this.rejectWorkflow(tx, shopId, instanceId, actorId);
      return;
    }

    if (allApproved) {
      const nextStepOrder = instance.currentStepOrder + 1;
      const nextSteps = instance.workflowDefinition.steps.filter(s => s.stepOrder === nextStepOrder);
      
      if (nextSteps.length > 0) {
        // Move to next step
        await tx.workflowInstance.update({
          where: { id: instanceId },
          data: { currentStepOrder: nextStepOrder }
        });
        await this.engine.spawnTasksForStep(tx, shopId, instanceId, instance.workflowDefinition.steps, nextStepOrder);
      } else {
        // Complete Workflow
        await tx.workflowInstance.update({
          where: { id: instanceId },
          data: { status: 'COMPLETED' }
        });
        await tx.workflowTimeline.create({
          data: { workflowInstanceId: instanceId, shopId, action: 'WORKFLOW_COMPLETED', actorId }
        });
      }
    }
  }

  private async rejectWorkflow(tx: Prisma.TransactionClient, shopId: string, instanceId: string, actorId: string) {
    await tx.workflowInstance.update({
      where: { id: instanceId },
      data: { status: 'REJECTED' }
    });
    
    // Cancel all other pending tasks for this instance
    await tx.workflowTask.updateMany({
      where: { workflowInstanceId: instanceId, status: 'PENDING' },
      data: { status: 'CANCELLED' }
    });
    
    await tx.workflowTimeline.create({
      data: { workflowInstanceId: instanceId, shopId, action: 'WORKFLOW_REJECTED', actorId }
    });
  }
}
