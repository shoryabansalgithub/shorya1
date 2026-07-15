import { Injectable } from '@nestjs/common';
import { ConfigDomain, EnvVariable } from '../../registry/registry.decorators';
import { IsNumber, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';

@Injectable()
@ConfigDomain({ owner: 'procurement', feature: 'ProcurementFeatureConfig', version: '1.0.0', description: 'Procurement module parameters' })
export class ProcurementFeatureConfig {
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => (value ? parseInt(value, 10) : 2000))
  @EnvVariable('VENDOR_BILL_PROCESSOR_DELAY_MS')
  vendorBillProcessorDelayMs: number = 2000;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => (value ? parseInt(value, 10) : 1500))
  @EnvVariable('GRN_PROCESSOR_BARCODE_DELAY_MS')
  grnProcessorBarcodeDelayMs: number = 1500;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => (value ? parseInt(value, 10) : 1000))
  @EnvVariable('GRN_PROCESSOR_ATTACHMENT_DELAY_MS')
  grnProcessorAttachmentDelayMs: number = 1000;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => (value ? parseInt(value, 10) : 1000))
  @EnvVariable('SUPPLIER_CREDIT_PROCESSOR_DELAY_MS')
  supplierCreditProcessorDelayMs: number = 1000;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => (value ? parseInt(value, 10) : 2000))
  @EnvVariable('PURCHASE_RETURN_PROCESSOR_DELAY_MS')
  purchaseReturnProcessorDelayMs: number = 2000;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => (value ? parseInt(value, 10) : 2000))
  @EnvVariable('PURCHASE_ATTACHMENT_PROCESSOR_DELAY_MS')
  purchaseAttachmentProcessorDelayMs: number = 2000;
}
