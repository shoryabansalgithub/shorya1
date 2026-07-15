import { Injectable } from '@nestjs/common';
import { ConfigDomain, EnvVariable } from '../../registry/registry.decorators';
import { IsNumber, IsOptional, Max, Min } from 'class-validator';
import { Transform } from 'class-transformer';

@Injectable()
@ConfigDomain({ owner: 'ocr', feature: 'OcrFeatureConfig', version: '1.0.0', description: 'OCR module parameters' })
export class OcrFeatureConfig {
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  @Transform(({ value }) => (value ? parseFloat(value) : 0.4))
  @EnvVariable('OCR_FUZZY_MATCH_THRESHOLD')
  fuzzyMatchThreshold: number = 0.4;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => (value ? parseInt(value, 10) : 30000))
  @EnvVariable('OCR_TIMEOUT_MS')
  timeoutMs: number = 30000;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => (value ? parseInt(value, 10) : 2000))
  @EnvVariable('OCR_BACKOFF_MS')
  backoffMs: number = 2000;
}
