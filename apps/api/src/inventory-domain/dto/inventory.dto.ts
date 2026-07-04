import { IsDecimal, IsEnum, IsOptional, IsString, Min } from 'class-validator';
import { AdjustmentReason } from '@prisma/client';

export class AdjustStockDto {
  @IsEnum(AdjustmentReason)
  reason: AdjustmentReason;

  @IsDecimal()
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
  @IsDecimal()
  onHand?: number;

  @IsOptional()
  @IsDecimal()
  reorderPoint?: number;

  @IsOptional()
  @IsDecimal()
  reorderQty?: number;

  @IsOptional()
  @IsDecimal()
  safetyStock?: number;

  @IsOptional()
  @IsDecimal()
  maxStock?: number;

  @IsOptional()
  @IsDecimal()
  minStock?: number;
}
