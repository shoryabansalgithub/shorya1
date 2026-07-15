import { Injectable } from '@nestjs/common';
import { ConfigDomain, EnvVariable } from '../../registry/registry.decorators';
import { IsNumber, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';

@Injectable()
@ConfigDomain({ owner: 'Analytics', feature: 'Analytics Domain', version: '1.0.0', description: 'Configuration for Analytics Domain Features' })
export class AnalyticsFeatureConfig {
  @IsNumber()
  @Transform(({ value }) => (value ? parseInt(value, 10) : 12))
  @EnvVariable('ANALYTICS_TREND_ANALYSIS_LIMIT')
  readonly trendAnalysisLimit: number = 12;

  @IsNumber()
  @Transform(({ value }) => (value ? parseInt(value, 10) : 20))
  @EnvVariable('ANALYTICS_RECENT_ORDERS_LIMIT')
  readonly recentOrdersLimit: number = 20;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => (value ? parseInt(value, 10) : 5))
  @EnvVariable('ANALYTICS_TOP_VENDORS_LIMIT')
  topVendorsLimit: number = 5;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => (value ? parseInt(value, 10) : 10))
  @EnvVariable('ANALYTICS_TOP_PRODUCTS_LIMIT')
  topProductsLimit: number = 10;
}
