import { Injectable } from '@nestjs/common';
import { IsOptional, IsNumber } from 'class-validator';

@Injectable()
export class QueueConfig {
  @IsOptional()
  @IsNumber()
  defaultConcurrency?: number;
}
