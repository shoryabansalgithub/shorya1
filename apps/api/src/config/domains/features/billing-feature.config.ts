import { Injectable } from '@nestjs/common';
import { ConfigDomain, EnvVariable } from '../../registry/registry.decorators';
import { IsNumber, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';

@Injectable()
@ConfigDomain({ owner: 'billing', feature: 'BillingFeatureConfig', version: '1.0.0', description: 'Billing module parameters' })
export class BillingFeatureConfig {
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => (value ? parseInt(value, 10) : 10000))
  @EnvVariable('BILLING_GATEWAY_TIMEOUT_MS')
  gatewayTimeoutMs: number = 10000;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => (value ? parseInt(value, 10) : 50))
  @EnvVariable('BILLING_JITTER_DELAY_BASE_MS')
  jitterDelayBaseMs: number = 50;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => (value ? parseInt(value, 10) : 100))
  @EnvVariable('BILLING_JITTER_DELAY_RANDOM_MULTIPLIER')
  jitterDelayRandomMultiplier: number = 100;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => (value ? parseInt(value, 10) : 5000))
  @EnvVariable('BILLING_TRANSACTION_MAX_WAIT_MS')
  transactionMaxWaitMs: number = 5000;
}
