import { Injectable } from '@nestjs/common';
import { IsOptional, IsNumber } from 'class-validator';

@Injectable()
export class HealthConfig {
  @IsOptional()
  @IsNumber()
  checkInterval?: number;
}
