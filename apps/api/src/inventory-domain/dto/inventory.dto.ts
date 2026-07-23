import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { AdjustmentReason } from '@prisma/client';

export class AdjustStockDto {
  @IsEnum(AdjustmentReason)
  reason: AdjustmentReason;

  @IsNumber()
  quantityChange: number;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  correlationId?: string;
}

export class CreateInventoryItemDto {
  @IsString()
  productId: string;

  @IsOptional()
  @IsString()
  variantId?: string;

  @IsOptional()
  @IsString()
  locationId?: string;

  @IsOptional()
  @IsNumber()
  onHand?: number;

  @IsOptional()
  @IsNumber()
  reorderPoint?: number;

  @IsOptional()
  @IsNumber()
  reorderQty?: number;

  @IsOptional()
  @IsNumber()
  safetyStock?: number;

  @IsOptional()
  @IsNumber()
  maxStock?: number;

  @IsOptional()
  @IsNumber()
  minStock?: number;
}
