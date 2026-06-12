import { Controller, Post, Body, Get, Logger, Request } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';

@Controller('customers')
export class CustomersController {
  private readonly logger = new Logger(CustomersController.name);

  constructor(private readonly customersService: CustomersService) {}

  @Post()
  async create(@Request() req: any, @Body() dto: CreateCustomerDto) {
    // Map strictly allowed fields and inject trusted shopId from JWT
    const safeData = {
      name: dto.name,
      phone: dto.phone,
      email: dto.email,
      address: dto.address,
      shopId: req.user.shopId,
    };
    return this.customersService.create(safeData);
  }

  @Get()
  async findAll(@Request() req: any) {
    return this.customersService.findAll(req.user.shopId);
  }
}
