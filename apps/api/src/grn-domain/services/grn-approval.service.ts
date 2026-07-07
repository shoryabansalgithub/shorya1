import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class GrnApprovalService {
  constructor(private readonly prisma: PrismaService) {}

  async processApproval(
    tx: Prisma.TransactionClient,
    shopId: string,
    id: string,
    actorId: string,
    action: 'APPROVE' | 'REJECT',
    comments?: string,
    signature?: string
  ) {
    const pendingApproval = await tx.goodsReceiptApproval.findFirst({
      where: { goodsReceiptId: id, shopId, status: 'PENDING' },
      orderBy: { step: 'desc' }
    });

    if (!pendingApproval) throw new BadRequestException('No pending approvals for this GRN');

    const nextStatus = action === 'APPROVE' ? 'APPROVED' : 'REJECTED';

    await tx.goodsReceiptApproval.update({
      where: { id: pendingApproval.id },
      data: {
        status: nextStatus,
        approverId: actorId,
        comments,
        digitalSignature: signature,
        updatedAt: new Date()
      }
    });

    // In a multi-step approval, we would check if there are more steps here.
    return nextStatus;
  }
}
