import { IsEnum, IsNumber, IsOptional, IsString, IsDateString } from 'class-validator';
import { BatchType } from '@prisma/client';

export class CreateBatchDto {
  @IsString()
  productId: string;

  @IsOptional()
  @IsString()
  variantId?: string;

  @IsString()
  batchNumber: string;

  @IsOptional()
  @IsString()
  supplierLotNumber?: string;

  @IsOptional()
  @IsDateString()
  mfgDate?: string;

  @IsOptional()
  @IsDateString()
  expiryDate?: string;

  @IsEnum(BatchType)
  type: BatchType;
}

export class AddBatchStockDto {
  @IsString()
  inventoryItemId: string;

  @IsNumber()
  quantity: number;
}
