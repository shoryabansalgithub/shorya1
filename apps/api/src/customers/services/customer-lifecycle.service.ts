import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CustomerLifecycleStatus } from '../domain/enums';
import { CustomerAuditService } from './customer-audit.service';

@Injectable()
export class CustomerLifecycleService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: CustomerAuditService
  ) {}

  async changeStatus(
    customerId: string, 
    newStatus: CustomerLifecycleStatus, 
    actorId?: string, 
    reason?: string
  ) {
    const customer = await this.prisma.customer.findUnique({ where: { id: customerId } });
    if (!customer) throw new BadRequestException('Customer not found');

    const oldStatus = customer.lifecycleStatus as CustomerLifecycleStatus;
    
    // Validate transition
    if (oldStatus === newStatus) {
      return customer;
    }

    if (oldStatus === CustomerLifecycleStatus.ARCHIVED && newStatus !== CustomerLifecycleStatus.ACTIVE) {
       throw new BadRequestException('Archived customers can only be activated');
    }

    const updated = await this.prisma.customer.update({
      where: { id: customerId },
      data: { lifecycleStatus: newStatus }
    });

    await this.prisma.customerStatusHistory.create({
      data: {
        customerId,
        status: newStatus,
        actorId,
        reason
      }
    });

    await this.auditService.logAction({
      customerId,
      actorId,
      action: 'STATUS_CHANGED',
      previousPayload: { status: oldStatus },
      newPayload: { status: newStatus },
    });

    return updated;
  }
}
