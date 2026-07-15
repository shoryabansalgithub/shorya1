import { Injectable } from '@nestjs/common';
import { ConfigDomain, EnvVariable } from '../../registry/registry.decorators';
import { IsNumber } from 'class-validator';
import { Transform } from 'class-transformer';

@Injectable()
@ConfigDomain({ owner: 'Search', feature: 'Product Search Domain', version: '1.0.0', description: 'Configuration for Product Search Features' })
export class SearchFeatureConfig {
  @IsNumber()
  @Transform(({ value }) => (value ? parseInt(value, 10) : 100))
  @EnvVariable('SEARCH_FUZZY_CANDIDATE_LIMIT')
  readonly fuzzyCandidateLimit: number = 100;

  @IsNumber()
  @Transform(({ value }) => (value ? parseInt(value, 10) : 5))
  @EnvVariable('SEARCH_RESULT_LIMIT')
  readonly searchResultLimit: number = 5;

  @IsNumber()
  @Transform(({ value }) => (value ? parseInt(value, 10) : 10))
  @EnvVariable('SEARCH_ANALYTICS_LIMIT')
  readonly analyticsLimit: number = 10;
}
