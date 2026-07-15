import { Injectable } from '@nestjs/common';
import { ValidationRule } from '../interfaces/validation-rule.interface';
import { ValidationContext } from '../validation.context';
import { ValidationError } from '../interfaces/validation-error.interface';
import { ValidationSeverity } from '../enums/validation-severity.enum';
import { ValidationCategory } from '../enums/validation-category.enum';
import { StorageConfig } from '../../domains/storage.config';
import { RuleDependencies } from '../../registry/registry.decorators';

@Injectable()
@RuleDependencies([StorageConfig])
export class StorageInfrastructureRule implements ValidationRule {
  validate(context: ValidationContext): ValidationError[] {
    const errors: ValidationError[] = [];
    const { storageConfig } = context;

    // If we are using S3 (indicated by s3Bucket being present)
    if (storageConfig.s3Bucket) {
      if (!storageConfig.s3Region) {
        errors.push({
          domain: 'StorageConfig',
          property: 's3Region',
          dependency: 's3Bucket',
          reason: 'S3 Region is required when S3 Bucket is configured.',
          severity: ValidationSeverity.CRITICAL,
          category: ValidationCategory.CROSS_DOMAIN,
          resolution: 'Provide S3_REGION environment variable.',
        });
      }

      if (!storageConfig.s3AccessKey || !storageConfig.s3SecretKey) {
        errors.push({
          domain: 'StorageConfig',
          property: 's3AccessKey / s3SecretKey',
          dependency: 's3Bucket',
          reason: 'S3 Credentials are required when S3 Bucket is configured.',
          severity: ValidationSeverity.CRITICAL,
          category: ValidationCategory.CROSS_DOMAIN,
          resolution: 'Provide S3_ACCESS_KEY and S3_SECRET_KEY environment variables.',
        });
      }
    } else if (!storageConfig.storageRoot) {
      // If neither S3 nor local storage is fully configured
      errors.push({
        domain: 'StorageConfig',
        property: 'storageRoot',
        dependency: 's3Bucket',
        reason: 'Either local storage (STORAGE_ROOT) or cloud storage (S3_BUCKET) must be configured.',
        severity: ValidationSeverity.CRITICAL,
        category: ValidationCategory.CROSS_DOMAIN,
        resolution: 'Provide either STORAGE_ROOT or S3_BUCKET environment variables.',
      });
    }

    return errors;
  }
}
