import { Injectable } from '@nestjs/common';
import { ConfigDomain, EnvVariable } from '../../registry/registry.decorators';
import { IsNumber, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';

@Injectable()
@ConfigDomain({ owner: 'Events', feature: 'Events Domain', version: '1.0.0', description: 'Configuration for Universal Events Features' })
export class EventsFeatureConfig {
  @IsNumber()
  @Transform(({ value }) => (value ? parseInt(value, 10) : 100))
  @EnvVariable('EVENTS_RECENT_LIMIT')
  readonly recentEventsLimit: number = 100;

  @IsNumber()
  @Transform(({ value }) => (value ? parseInt(value, 10) : 50))
  @EnvVariable('EVENTS_WEBHOOK_DELIVERY_LIMIT')
  readonly webhookDeliveryLimit: number = 50;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => (value ? parseInt(value, 10) : 100))
  @EnvVariable('EVENTS_OUTBOX_PROCESSOR_BATCH_SIZE')
  outboxProcessorBatchSize: number = 100;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => (value ? parseInt(value, 10) : 10000))
  @EnvVariable('EVENTS_WEBHOOK_TIMEOUT_MS')
  webhookTimeoutMs: number = 10000;
}
