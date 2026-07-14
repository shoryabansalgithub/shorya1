import { Injectable } from '@nestjs/common';
import { IsOptional, IsBoolean } from 'class-validator';

@Injectable()
export class SwaggerConfig {
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;
}
