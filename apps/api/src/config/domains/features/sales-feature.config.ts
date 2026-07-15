import { Injectable } from '@nestjs/common';
import { ConfigDomain, EnvVariable } from '../../registry/registry.decorators';
import { IsNumber, IsOptional, Min } from 'class-validator';
import { Transform } from 'class-transformer';

@Injectable()
@ConfigDomain({ owner: 'Sales', feature: 'Sales Events', version: '1.0.0', description: 'Configuration for Sales Domain Features' })
export class SalesFeatureConfig {
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => (value ? parseInt(value, 10) : 50))
  @EnvVariable('SALES_DEFAULT_PAGINATION_LIMIT')
  defaultPaginationLimit: number = 50;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => (value ? parseInt(value, 10) : 100))
  @EnvVariable('SALES_RECENT_EVENTS_LIMIT')
  readonly recentEventsLimit: number = 100;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => (value ? parseInt(value, 10) : 10000))
  @EnvVariable('SALES_CREDIT_HOLD_THRESHOLD')
  creditHoldThreshold: number = 10000;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Transform(({ value }) => (value ? parseInt(value, 10) : 5000))
  @EnvVariable('SALES_DEFAULT_CREDIT_LIMIT')
  defaultCreditLimit: number = 5000;
}
