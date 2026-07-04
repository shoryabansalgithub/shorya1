import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { EventsModule } from '../events-domain/events.module';
import { SalesOrderController } from './sales-order.controller';
import { SalesOrderService } from './services/sales-order.service';
import { OrderValidationEngine } from './services/order-validation-engine';
import { OrderNumberEngine } from './services/order-number-engine';
import { SnapshotEngine } from './services/snapshot-engine';
import { SalesOrderStateMachine } from './services/sales-order-state-machine';
import { OrderCalculationEngine } from './engines/order-calculation-engine';
import { OrderModificationEngine } from './engines/order-modification-engine';
import { SalesOrderQueries } from './queries/sales-order-queries';
import { SalesOrderCacheService } from './services/sales-order-cache.service';
import { SalesOrderBulkWorker } from './workers/sales-order-bulk.worker';
import { BullModule } from '@nestjs/bullmq';
import { WorkflowOrchestrator } from './workflow-engines/workflow-orchestrator';
import { FraudHoldEngine, CreditHoldEngine } from './workflow-engines/hold-engines';
import { WarehouseAllocationEngine, BackorderEngine } from './workflow-engines/logistics-engines';
import { OrderSplitEngine } from './workflow-engines/order-split-engine';
import { SalesWorkflowWorker } from './workflow-engines/workflow-workers';
import { SalesWorkflowController } from './workflow-engines/sales-workflow.controller';
import { WorkflowCacheService } from './workflow-engines/workflow-cache.service';

@Module({
  imports: [
    PrismaModule, 
    EventsModule,
    BullModule.registerQueue({
      name: 'sales-order-bulk-queue',
    }),
    BullModule.registerQueue({
      name: 'sales-workflow-queue',
    }),
  ],
  controllers: [SalesOrderController, SalesWorkflowController],
  providers: [
    SalesOrderService,
    OrderValidationEngine,
    OrderNumberEngine,
    SnapshotEngine,
    SalesOrderStateMachine,
    OrderCalculationEngine,
    OrderModificationEngine,
    SalesOrderQueries,
    SalesOrderCacheService,
    SalesOrderBulkWorker,
    WorkflowOrchestrator,
    FraudHoldEngine,
    CreditHoldEngine,
    WarehouseAllocationEngine,
    BackorderEngine,
    OrderSplitEngine,
    SalesWorkflowWorker,
    WorkflowCacheService
  ],
  exports: [SalesOrderService, WorkflowOrchestrator]
})
export class SalesDomainModule {}
