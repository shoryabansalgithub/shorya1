import { Controller, Post, Body, Request, BadRequestException, UseGuards } from '@nestjs/common';
import { BillingService } from './billing.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { Role } from '@prisma/client';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

@Controller('billing')
@UseGuards(RolesGuard)
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Post('invoice')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.MANAGER, Role.CASHIER)
  async createInvoice(@Request() req: any, @Body() dto: CreateInvoiceDto) {
    if (!req.user || !req.user.shopId) {
      throw new BadRequestException('User missing shop assignment');
    }
    
    // Security: Override admin flag securely from server-side role
    dto.adminOverride = [Role.ADMIN, Role.SUPER_ADMIN, Role.MANAGER].includes(req.user.role);

    return this.billingService.createInvoice(dto, {
      userId: req.user.id,
      shopId: req.user.shopId,
      ipAddress: req.ip,
    });
  }
}
