import { Injectable } from '@nestjs/common';
import { IsOptional, IsNumber } from 'class-validator';

@Injectable()
export class MediaConfig {
  @IsOptional()
  @IsNumber()
  maxSize?: number;
}
