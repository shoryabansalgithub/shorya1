import { Injectable } from '@nestjs/common';
import { IsOptional, IsString } from 'class-validator';

@Injectable()
export class SearchConfig {
  @IsOptional()
  @IsString()
  elasticsearchUrl?: string;
}
