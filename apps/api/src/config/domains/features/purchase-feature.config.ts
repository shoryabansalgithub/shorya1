import { Injectable } from '@nestjs/common';
import { ConfigDomain, EnvVariable } from '../../registry/registry.decorators';
import { IsNumber, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';

@Injectable()
@ConfigDomain({ owner: 'Purchase', feature: 'Purchase Events', version: '1.0.0', description: 'Configuration for Purchase Domain Features' })
export class PurchaseFeatureConfig {
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => (value ? parseInt(value, 10) : 50))
  @EnvVariable('PURCHASE_DEAD_LETTER_PAGINATION_LIMIT')
  deadLetterPaginationLimit: number = 50;
}
