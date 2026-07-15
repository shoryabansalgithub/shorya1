import { Injectable } from '@nestjs/common';
import { ConfigDomain, EnvVariable } from '../registry/registry.decorators';
import { IsString, IsNotEmpty } from 'class-validator';

@Injectable()
@ConfigDomain({ owner: 'Database', feature: 'Configuration', version: '1.0.0', description: 'DatabaseConfig Domain' })
export class DatabaseConfig {
  @IsString()
  @IsNotEmpty()
  @EnvVariable('DATABASE_URL')
  readonly databaseUrl: string;
}
