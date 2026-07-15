import { Injectable } from '@nestjs/common';
import { ConfigDomain, EnvVariable } from '../registry/registry.decorators';
import { IsOptional, IsBoolean, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

@Injectable()
@ConfigDomain({ owner: 'Cron', feature: 'Configuration', version: '1.0.0', description: 'CronConfig Domain' })
export class CronConfig {
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @IsOptional()
  @IsString()
  @EnvVariable('CRON_SALES_OUTBOX_RELAY')
  salesOutboxRelayCron: string = '* * * * * *'; // EVERY_SECOND

  @IsOptional()
  @IsString()
  @EnvVariable('CRON_PURCHASE_OUTBOX_RELAY')
  purchaseOutboxRelayCron: string = '* * * * * *'; // EVERY_SECOND

  @IsOptional()
  @IsString()
  @EnvVariable('CRON_EVENTS_OUTBOX_RELAY')
  eventsOutboxRelayCron: string = '*/5 * * * * *'; // EVERY_5_SECONDS

  @IsOptional()
  @IsString()
  @EnvVariable('CRON_PRODUCT_OUTBOX_RELAY')
  productOutboxRelayCron: string = '* * * * * *'; // EVERY_SECOND

  @IsOptional()
  @IsString()
  @EnvVariable('CRON_INVENTORY_RECON')
  inventoryReconCron: string = '*/5 * * * *'; // EVERY_5_MINUTES

  @IsOptional()
  @IsString()
  @EnvVariable('CRON_ANALYTICS_JOB')
  analyticsJobCron: string = '0 0 * * *'; // EVERY_DAY_AT_MIDNIGHT
}
