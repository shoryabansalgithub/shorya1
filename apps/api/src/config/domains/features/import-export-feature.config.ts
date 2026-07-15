import { Injectable } from '@nestjs/common';
import { ConfigDomain, EnvVariable } from '../../registry/registry.decorators';
import { IsNumber } from 'class-validator';
import { Transform } from 'class-transformer';

@Injectable()
@ConfigDomain({ owner: 'Import/Export', feature: 'Data Import/Export', version: '1.0.0', description: 'Configuration for Data Import and Export' })
export class ImportExportFeatureConfig {
  @IsNumber()
  @Transform(({ value }) => (value ? parseInt(value, 10) : 100))
  @EnvVariable('IMPORT_EXPORT_LIST_LIMIT')
  readonly exportListLimit: number = 100;
}
