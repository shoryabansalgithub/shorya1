import { Test, TestingModule } from '@nestjs/testing';
import { WorkflowBudgetService } from './workflow-budget.service';
import { Prisma } from '@prisma/client';
import { BadRequestException } from '@nestjs/common';

describe('WorkflowBudgetService', () => {
  let service: WorkflowBudgetService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WorkflowBudgetService],
    }).compile();

    service = module.get<WorkflowBudgetService>(WorkflowBudgetService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should allow if no department is specified', async () => {
    const tx = {} as Prisma.TransactionClient;
    await expect(service.validateDocumentBudget(tx, 'shop-1', null, 1000, 500)).resolves.toBeUndefined();
  });

  it('should reject if projected spend exceeds budget', async () => {
    const tx = {
      purchaseOrder: {
        aggregate: jest.fn().mockResolvedValue({ _sum: { totalAmount: 4000 } })
      }
    } as unknown as Prisma.TransactionClient;

    await expect(service.validateDocumentBudget(tx, 'shop-1', 'IT', 2000, 5000))
      .rejects.toThrow(BadRequestException);
  });

  it('should allow if projected spend is within budget', async () => {
    const tx = {
      purchaseOrder: {
        aggregate: jest.fn().mockResolvedValue({ _sum: { totalAmount: 4000 } })
      }
    } as unknown as Prisma.TransactionClient;

    await expect(service.validateDocumentBudget(tx, 'shop-1', 'IT', 500, 5000))
      .resolves.toBeUndefined();
  });
});
