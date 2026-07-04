import { Type } from 'class-transformer';
import { IsArray, IsEnum, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { ReservationSource } from '@prisma/client';

export class CreateReservationItemDto {
  @IsString()
  productId: string;

  @IsOptional()
  @IsString()
  variantId?: string;

  @IsNumber()
  requestedQuantity: number;
}

export class CreateReservationDto {
  @IsEnum(ReservationSource)
  source: ReservationSource;

  @IsOptional()
  @IsString()
  referenceId?: string;

  @IsOptional()
  expiresInSeconds?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateReservationItemDto)
  items: CreateReservationItemDto[];
}
