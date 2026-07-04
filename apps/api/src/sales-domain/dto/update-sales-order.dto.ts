import { IsString, IsOptional, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { SalesOrderStatus } from '@prisma/client';

export class UpdateSalesOrderDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  customerId?: string;

  @ApiPropertyOptional({ enum: SalesOrderStatus })
  @IsEnum(SalesOrderStatus)
  @IsOptional()
  status?: SalesOrderStatus;
}
