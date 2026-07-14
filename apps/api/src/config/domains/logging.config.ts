import { Injectable } from '@nestjs/common';
import { IsOptional, IsString } from 'class-validator';

@Injectable()
export class LoggingConfig {
  @IsOptional()
  @IsString()
  logLevel?: string;
}
