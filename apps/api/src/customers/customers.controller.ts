import { Controller, Post, Body, Get, Logger, Request } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';

@Controller('customers')
export class CustomersController {
  private readonly logger = new Logger(CustomersController.name);

  constructor(private readonly customersService: CustomersService) {}

  @Post()
  async create(@Request() req: any, @Body() dto: CreateCustomerDto) {
    const safeData = {
      name: dto.name,
      phone: dto.phone,
      email: dto.email,
      address: dto.address,
    };
    return this.customersService.create(safeData);
  }

  @Get()
  async findAll() {
    return this.customersService.findAll();
  }
}
