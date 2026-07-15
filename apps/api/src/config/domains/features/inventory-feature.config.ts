import { Injectable } from '@nestjs/common';
import { ConfigDomain, EnvVariable } from '../../registry/registry.decorators';
import { IsNumber, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';

@Injectable()
@ConfigDomain({ owner: 'Inventory', feature: 'Inventory Domain', version: '1.0.0', description: 'Configuration for Inventory Features' })
export class InventoryFeatureConfig {
  @IsNumber()
  @Transform(({ value }) => (value ? parseInt(value, 10) : 20))
  @EnvVariable('INVENTORY_RECENT_ADJUSTMENTS_LIMIT')
  readonly recentAdjustmentsLimit: number = 20;

  @IsNumber()
  @Transform(({ value }) => (value ? parseInt(value, 10) : 20))
  @EnvVariable('INVENTORY_RECENT_MOVEMENTS_LIMIT')
  readonly recentMovementsLimit: number = 20;

  @IsNumber()
  @Transform(({ value }) => (value ? parseInt(value, 10) : 10))
  @EnvVariable('INVENTORY_UNRESOLVED_ALERTS_LIMIT')
  readonly unresolvedAlertsLimit: number = 10;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => (value ? parseInt(value, 10) : 100))
  @EnvVariable('INVENTORY_LIST_LIMIT')
  inventoryListLimit: number = 100;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => (value ? parseInt(value, 10) : 1000))
  @EnvVariable('INVENTORY_RECON_BATCH_SIZE')
  reconBatchSize: number = 1000;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => (value ? parseInt(value, 10) : 600000))
  @EnvVariable('INVENTORY_RECON_LOCK_TTL_MS')
  reconLockTtlMs: number = 600000;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => (value ? parseInt(value, 10) : 1000))
  @EnvVariable('INVENTORY_MAX_PRINT_QUANTITY')
  maxPrintQuantity: number = 1000;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => (value ? parseInt(value, 10) : 900000))
  @EnvVariable('INVENTORY_RECON_LOOKBACK_MS')
  reconLookbackMs: number = 900000;
}
