import { Injectable } from '@nestjs/common';
import { IsOptional, IsString } from 'class-validator';

@Injectable()
export class BullConfig {
  @IsOptional()
  @IsString()
  redisUrl?: string;
}
