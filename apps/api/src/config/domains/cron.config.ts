import { Injectable } from '@nestjs/common';
import { IsOptional, IsBoolean } from 'class-validator';

@Injectable()
export class CronConfig {
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;
}
