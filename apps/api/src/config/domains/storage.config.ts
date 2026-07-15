import { Injectable } from '@nestjs/common';
import { ConfigDomain, EnvVariable } from '../registry/registry.decorators';
import { IsString, IsOptional } from 'class-validator';

@Injectable()
@ConfigDomain({ owner: 'Storage', feature: 'Configuration', version: '1.0.0', description: 'StorageConfig Domain' })
export class StorageConfig {
  @IsString()
  @IsOptional()
  @EnvVariable('STORAGE_ROOT')
  readonly storageRoot?: string;

  @IsString()
  @IsOptional()
  @EnvVariable('S3_REGION')
  readonly s3Region?: string;

  @IsString()
  @IsOptional()
  @EnvVariable('S3_ENDPOINT')
  readonly s3Endpoint?: string;

  @IsString()
  @IsOptional()
  @EnvVariable('S3_ACCESS_KEY')
  readonly s3AccessKey?: string;

  @IsString()
  @IsOptional()
  @EnvVariable('S3_SECRET_KEY')
  readonly s3SecretKey?: string;

  @IsString()
  @IsOptional()
  @EnvVariable('S3_BUCKET')
  readonly s3Bucket?: string;

  @IsString()
  @IsOptional()
  @EnvVariable('S3_PUBLIC_URL')
  readonly s3PublicUrl?: string;
}
