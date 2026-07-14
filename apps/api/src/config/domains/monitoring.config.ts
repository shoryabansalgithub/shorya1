import { Injectable } from '@nestjs/common';
import { IsOptional, IsString } from 'class-validator';

@Injectable()
export class MonitoringConfig {
  @IsOptional()
  @IsString()
  sentryDsn?: string;
}
