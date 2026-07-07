import { Injectable, BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

@Injectable()
export class WorkflowBudgetService {
  /**
   * Enforces Departmental Budget constraints based on MTD (Month-to-Date) spend.
   * Compares current requested amount + existing MTD spend against a configured threshold.
   */
  async validateDocumentBudget(tx: Prisma.TransactionClient, shopId: string, department: string | null, requestedAmount: number, budgetLimit: number) {
    if (!department) return; // No department, no budget to enforce
    
    const now = new Date();
    const firstDayOfMonth = new Date(Date.UTC(now.getFullYear(), now.getMonth(), 1));

    const mtdSpendAgg = await tx.purchaseOrder.aggregate({
      where: {
        shopId,
        department,
        createdAt: { gte: firstDayOfMonth },
        status: { notIn: ['DRAFT', 'CANCELLED', 'REJECTED'] }
      },
      _sum: { totalAmount: true }
    });

    const currentMtdSpend = Number(mtdSpendAgg._sum.totalAmount || 0);
    const projectedSpend = currentMtdSpend + requestedAmount;

    if (projectedSpend > budgetLimit) {
      throw new BadRequestException(`Budget Exceeded: Department '${department}' has a monthly budget of $${budgetLimit}. Current MTD spend is $${currentMtdSpend}. Requested $${requestedAmount} exceeds limits.`);
    }
  }
}
