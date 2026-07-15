import { Injectable } from '@nestjs/common';
import { ConfigDomain, EnvVariable } from '../registry/registry.decorators';
import { IsString, IsOptional } from 'class-validator';

@Injectable()
@ConfigDomain({ owner: 'Ai', feature: 'Configuration', version: '1.0.0', description: 'AiConfig Domain' })
export class AiConfig {
  @IsString()
  @IsOptional()
  @EnvVariable('GEMINI_API_KEY')
  readonly geminiApiKey?: string;
}
