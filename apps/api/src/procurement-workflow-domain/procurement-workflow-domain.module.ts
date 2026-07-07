import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { SalesEventsDomainModule } from '../sales-events-domain/sales-events-domain.module';
import { BullModule } from '@nestjs/bullmq';

import { ProcurementWorkflowController } from './procurement-workflow.controller';
import { WorkflowRepository } from './repositories/workflow.repository';
import { WorkflowEngineService } from './services/workflow-engine.service';
import { WorkflowApprovalService } from './services/workflow-approval.service';
import { WorkflowDelegationService } from './services/workflow-delegation.service';
import { WorkflowEscalationService } from './services/workflow-escalation.service';
import { WorkflowBudgetService } from './services/workflow-budget.service';
import { WorkflowProcessorService } from './services/workflow-processor.service';
import { WorkflowEventListener } from './services/workflow-event.listener';

@Module({
  imports: [
    PrismaModule, 
    SalesEventsDomainModule,
    BullModule.registerQueue({ name: 'workflow-engine' })
  ],
  controllers: [ProcurementWorkflowController],
  providers: [
    WorkflowRepository,
    WorkflowEngineService,
    WorkflowApprovalService,
    WorkflowDelegationService,
    WorkflowEscalationService,
    WorkflowBudgetService,
    WorkflowProcessorService,
    WorkflowEventListener
  ],
  exports: [WorkflowRepository, WorkflowEngineService]
})
export class ProcurementWorkflowDomainModule {}
