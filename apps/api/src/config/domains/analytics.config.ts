import { Injectable } from '@nestjs/common';
import { IsOptional, IsString } from 'class-validator';

@Injectable()
export class AnalyticsConfig {
  @IsOptional()
  @IsString()
  trackingId?: string;
}
