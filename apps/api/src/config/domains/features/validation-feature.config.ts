import { Injectable } from '@nestjs/common';
import { ConfigDomain, EnvVariable } from '../../registry/registry.decorators';
import { IsNumber } from 'class-validator';
import { Transform } from 'class-transformer';

@Injectable()
@ConfigDomain({ owner: 'Validation', feature: 'Product Validation Domain', version: '1.0.0', description: 'Configuration for Product Validation Features' })
export class ValidationFeatureConfig {
  @IsNumber()
  @Transform(({ value }) => (value ? parseInt(value, 10) : 200))
  @EnvVariable('VALIDATION_DUPLICATE_SCAN_LIMIT')
  readonly duplicateScanLimit: number = 200;
}
