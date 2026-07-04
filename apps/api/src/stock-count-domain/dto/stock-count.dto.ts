import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { CountType, AdjustmentReason } from '@prisma/client';

export class CreateStockCountSessionDto {
  @IsOptional()
  @IsString()
  warehouseId?: string;

  @IsEnum(CountType)
  type: CountType;

  @IsOptional()
  @IsString()
  assignedToUserId?: string;
}

export class SubmitCountItemDto {
  @IsString()
  inventoryItemId: string;

  @IsNumber()
  countedQuantity: number;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreateAdjustmentRequestDto {
  @IsString()
  inventoryItemId: string;

  @IsNumber()
  requestedQuantityDelta: number;

  @IsEnum(AdjustmentReason)
  reason: AdjustmentReason;

  @IsOptional()
  @IsString()
  countItemId?: string;
}
