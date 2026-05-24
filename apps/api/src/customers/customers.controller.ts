import { Controller, Post, Body, Get, Logger } from '@nestjs/common';
import { CustomersService } from './customers.service';

@Controller('customers')
export class CustomersController {
  private readonly logger = new Logger(CustomersController.name);

  constructor(private readonly customersService: CustomersService) {}

  @Post()
  async create(@Body() createCustomerDto: any) {
    this.logger.log(`Incoming frontend request data to POST /customers: ${JSON.stringify(createCustomerDto)}`);
    return this.customersService.create(createCustomerDto);
  }

  @Get()
  async findAll() {
    this.logger.log('Incoming frontend request to GET /customers');
    return this.customersService.findAll();
  }
}
