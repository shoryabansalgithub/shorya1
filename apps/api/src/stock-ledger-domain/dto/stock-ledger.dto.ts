import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { StockMovementType } from '@prisma/client';

export class CreateLedgerEntryDto {
  @IsString()
  inventoryItemId: string;

  @IsEnum(StockMovementType)
  movementType: StockMovementType;

  @IsNumber()
  quantity: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  unitCost?: number;

  @IsOptional()
  @IsString()
  referenceType?: string;

  @IsOptional()
  @IsString()
  referenceId?: string;

  @IsOptional()
  @IsString()
  documentId?: string;

  @IsOptional()
  @IsString()
  correlationId?: string;
}
