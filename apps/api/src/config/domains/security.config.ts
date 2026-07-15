import { Injectable } from '@nestjs/common';
import { ConfigDomain, EnvVariable } from '../registry/registry.decorators';
import { IsOptional, IsNumber } from 'class-validator';
import { Transform } from 'class-transformer';

@Injectable()
@ConfigDomain({ owner: 'Security', feature: 'Configuration', version: '1.0.0', description: 'SecurityConfig Domain' })
export class SecurityConfig {
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => (value ? parseInt(value, 10) : 10))
  @EnvVariable('BCRYPT_ROUNDS')
  bcryptRounds: number = 10;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => (value ? parseInt(value, 10) : 1000))
  @EnvVariable('RATE_LIMIT_SHORT_TTL')
  rateLimitShortTtl: number = 1000;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => (value ? parseInt(value, 10) : 3))
  @EnvVariable('RATE_LIMIT_SHORT_LIMIT')
  rateLimitShortLimit: number = 3;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => (value ? parseInt(value, 10) : 10000))
  @EnvVariable('RATE_LIMIT_MEDIUM_TTL')
  rateLimitMediumTtl: number = 10000;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => (value ? parseInt(value, 10) : 20))
  @EnvVariable('RATE_LIMIT_MEDIUM_LIMIT')
  rateLimitMediumLimit: number = 20;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => (value ? parseInt(value, 10) : 60000))
  @EnvVariable('RATE_LIMIT_LONG_TTL')
  rateLimitLongTtl: number = 60000;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => (value ? parseInt(value, 10) : 100))
  @EnvVariable('RATE_LIMIT_LONG_LIMIT')
  rateLimitLongLimit: number = 100;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => (value ? parseInt(value, 10) : 5))
  @EnvVariable('AUTH_RATE_LIMIT_SHORT_LIMIT')
  authRateLimitShortLimit: number = 5;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => (value ? parseInt(value, 10) : 20))
  @EnvVariable('AUTH_RATE_LIMIT_MEDIUM_LIMIT')
  authRateLimitMediumLimit: number = 20;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => (value ? parseInt(value, 10) : 100))
  @EnvVariable('AUTH_RATE_LIMIT_LONG_LIMIT')
  authRateLimitLongLimit: number = 100;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => (value ? parseInt(value, 10) : 5))
  @EnvVariable('SECURITY_MAX_LOGIN_ATTEMPTS')
  maxLoginAttempts: number = 5;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => (value ? parseInt(value, 10) : 900000))
  @EnvVariable('SECURITY_LOCKOUT_DURATION_MS')
  lockoutDurationMs: number = 900000;
}
