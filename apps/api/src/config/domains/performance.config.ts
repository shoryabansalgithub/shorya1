import { Injectable } from '@nestjs/common';
import { IsOptional, IsNumber } from 'class-validator';

@Injectable()
export class PerformanceConfig {
  @IsOptional()
  @IsNumber()
  maxMemory?: number;
}
