import { Injectable } from '@nestjs/common';
import { IsString, IsOptional } from 'class-validator';

@Injectable()
export class StorageConfig {
  @IsString()
  @IsOptional()
  readonly storageRoot?: string;

  @IsString()
  @IsOptional()
  readonly s3Region?: string;

  @IsString()
  @IsOptional()
  readonly s3Endpoint?: string;

  @IsString()
  @IsOptional()
  readonly s3AccessKey?: string;

  @IsString()
  @IsOptional()
  readonly s3SecretKey?: string;

  @IsString()
  @IsOptional()
  readonly s3Bucket?: string;

  @IsString()
  @IsOptional()
  readonly s3PublicUrl?: string;
}
