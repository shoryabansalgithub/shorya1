import { Injectable } from '@nestjs/common';
import { ConfigDomain, EnvVariable } from '../registry/registry.decorators';
import { IsOptional, IsNumber, IsBoolean, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

@Injectable()
@ConfigDomain({ owner: 'Bull', feature: 'Configuration', version: '1.0.0', description: 'BullConfig Domain' })
export class BullConfig {
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => (value ? parseInt(value, 10) : 3))
  @EnvVariable('BULL_ATTEMPTS')
  defaultAttempts: number = 3;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value || 'exponential')
  @EnvVariable('BULL_BACKOFF_TYPE')
  backoffType: string = 'exponential';

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => (value ? parseInt(value, 10) : 1000))
  @EnvVariable('BULL_BACKOFF_DELAY')
  backoffDelay: number = 1000;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value !== 'false')
  @EnvVariable('BULL_REMOVE_ON_COMPLETE')
  removeOnComplete: boolean = true;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  @EnvVariable('BULL_REMOVE_ON_FAIL')
  removeOnFail: boolean = false;
}
