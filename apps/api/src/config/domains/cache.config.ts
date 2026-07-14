import { Injectable } from '@nestjs/common';
import { IsOptional, IsNumber } from 'class-validator';

@Injectable()
export class CacheConfig {
  @IsOptional()
  @IsNumber()
  ttl?: number;
}
