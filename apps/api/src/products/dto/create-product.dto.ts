import { IsString, IsOptional, IsNumber, IsBoolean, IsEnum, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ProductType, ProductStatus, ProductUnit, GstRate } from '@prisma/client';

export class CreateProductDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  slug?: string;

  @IsString()
  sku: string;

  @IsString()
  @IsOptional()
  barcode?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(ProductType)
  @IsOptional()
  type?: ProductType;

  @IsEnum(ProductStatus)
  @IsOptional()
  status?: ProductStatus;

  @IsNumber()
  costPrice: number;

  @IsNumber()
  sellingPrice: number;

  @IsNumber()
  mrp: number;

  @IsNumber()
  wholesalePrice: number;

  @IsEnum(GstRate)
  @IsOptional()
  gstRate?: GstRate;

  @IsString()
  @IsOptional()
  hsnCode?: string;

  @IsString()
  @IsOptional()
  categoryId?: string;

  @IsString()
  @IsOptional()
  supplierId?: string;
  
  @IsString()
  @IsOptional()
  brandId?: string;

  @IsEnum(ProductUnit)
  unit: ProductUnit;

  @IsBoolean()
  @IsOptional()
  hasExpiry?: boolean;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class UpdateProductDto extends CreateProductDto {}
