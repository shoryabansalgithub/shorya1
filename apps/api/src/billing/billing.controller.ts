import { Controller, Post, Body, Request, BadRequestException } from '@nestjs/common';
import { BillingService } from './billing.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { Role } from '@prisma/client';

@Controller('billing')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Post('invoice')
  async createInvoice(@Request() req: any, @Body() dto: CreateInvoiceDto) {
    if (!req.user || !req.user.shopId) {
      throw new BadRequestException('User missing shop assignment');
    }
    
    // Security Phase 2: Override admin flag securely from server-side role
    dto.adminOverride = [Role.ADMIN, Role.SUPER_ADMIN, Role.MANAGER].includes(req.user.role);

    return this.billingService.createInvoice(dto, {
      userId: req.user.id,
      shopId: req.user.shopId,
      ipAddress: req.ip,
    });
  }
}
