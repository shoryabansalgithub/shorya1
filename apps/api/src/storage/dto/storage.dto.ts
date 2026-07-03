import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsObject,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';
import {
  BackupType,
  CloudUploadFolder,
  StorageCustomerDirectory,
} from '../storage-security.constants';

export class CreateCustomerFolderDto {
  @ApiProperty()
  @IsString()
  @MaxLength(64)
  customerId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  customerData?: Record<string, unknown>;
}

export class StoreInvoiceBodyDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  jsonContent?: string;
}

export class StoreCapturedBillBodyDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(10000)
  ocrText?: string;
}

export class StorePaymentDto {
  @ApiProperty()
  @IsObject()
  paymentData: Record<string, unknown>;
}

export class DeleteStorageFileDto {
  @ApiProperty({ enum: StorageCustomerDirectory })
  @IsEnum(StorageCustomerDirectory)
  category: StorageCustomerDirectory;

  @ApiProperty({ example: '2026/May' })
  @IsString()
  @Matches(/^\d{4}[\\/][a-zA-Z0-9 _.-]+$/)
  datePath: string;

  @ApiProperty()
  @IsString()
  @MaxLength(180)
  fileName: string;
}

export class BackupStorageDto {
  @ApiPropertyOptional({ enum: BackupType, default: BackupType.Daily })
  @IsOptional()
  @IsEnum(BackupType)
  type?: BackupType;
}

export class CloudUploadDto {
  @ApiPropertyOptional({ enum: CloudUploadFolder, default: CloudUploadFolder.General })
  @IsOptional()
  @IsEnum(CloudUploadFolder)
  folder?: CloudUploadFolder;
}
