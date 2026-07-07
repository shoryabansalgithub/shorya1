import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { WorkflowEngineService } from './workflow-engine.service';
import { PrismaService } from '../../prisma/prisma.service';
import { OnEvent } from '@nestjs/event-emitter';

@Injectable()
export class WorkflowEventListener implements OnModuleInit {
  private readonly logger = new Logger(WorkflowEventListener.name);

  constructor(
    private readonly engine: WorkflowEngineService,
    private readonly prisma: PrismaService
  ) {}

  onModuleInit() {
    this.logger.log('Initializing Workflow Event Listeners...');
  }
  
  @OnEvent('PurchaseOrderSubmitted')
  async handlePurchaseOrderSubmitted(event: any) {
    this.logger.log(`Received PurchaseOrderSubmitted for ${event.aggregateId}, spawning workflow`);
    await this.prisma.$transaction(async (tx) => {
       await this.engine.spawnWorkflow(tx, event.shopId, 'PURCHASE_ORDER', event.aggregateId, event.payload);
    });
  }

  @OnEvent('VendorBillSubmitted')
  async handleVendorBillSubmitted(event: any) {
    this.logger.log(`Received VendorBillSubmitted for ${event.aggregateId}, spawning workflow`);
    await this.prisma.$transaction(async (tx) => {
       await this.engine.spawnWorkflow(tx, event.shopId, 'VENDOR_BILL', event.aggregateId, event.payload);
    });
  }
    
  @OnEvent('PurchaseReturnSubmitted')
  async handlePurchaseReturnSubmitted(event: any) {
    this.logger.log(`Received PurchaseReturnSubmitted for ${event.aggregateId}`);
    await this.prisma.$transaction(async (tx) => {
       await this.engine.spawnWorkflow(tx, event.shopId, 'PURCHASE_RETURN', event.aggregateId, event.payload);
    });
  }
    
  @OnEvent('SupplierCreditSubmitted')
  async handleSupplierCreditSubmitted(event: any) {
    this.logger.log(`Received SupplierCreditSubmitted for ${event.aggregateId}`);
    await this.prisma.$transaction(async (tx) => {
       await this.engine.spawnWorkflow(tx, event.shopId, 'SUPPLIER_CREDIT', event.aggregateId, event.payload);
    });
  }
}
