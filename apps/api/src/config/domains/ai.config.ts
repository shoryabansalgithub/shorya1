import { Injectable } from '@nestjs/common';
import { IsString, IsOptional } from 'class-validator';

@Injectable()
export class AiConfig {
  @IsString()
  @IsOptional()
  readonly geminiApiKey?: string;
}
