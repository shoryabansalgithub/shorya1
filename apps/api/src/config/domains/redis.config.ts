import { Injectable } from '@nestjs/common';
import { ConfigDomain, EnvVariable } from '../registry/registry.decorators';
import { IsString, IsNotEmpty } from 'class-validator';

@Injectable()
@ConfigDomain({ owner: 'Redis', feature: 'Configuration', version: '1.0.0', description: 'RedisConfig Domain' })
export class RedisConfig {
  @IsString()
  @IsNotEmpty()
  @EnvVariable('REDIS_URL')
  readonly redisUrl: string;
}
