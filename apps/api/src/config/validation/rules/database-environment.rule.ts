import { Injectable } from '@nestjs/common';
import { ValidationRule } from '../interfaces/validation-rule.interface';
import { ValidationContext } from '../validation.context';
import { ValidationCategory } from '../enums/validation-category.enum';
import { ValidationError } from '../interfaces/validation-error.interface';
import { ValidationSeverity } from '../enums/validation-severity.enum';
import { Environment, AppConfig } from '../../domains/app.config';
import { DatabaseConfig } from '../../domains/database.config';
import { RuleDependencies } from '../../registry/registry.decorators';
@Injectable()
@RuleDependencies([DatabaseConfig, AppConfig])
export class DatabaseEnvironmentRule implements ValidationRule {
  validate(context: ValidationContext): ValidationError[] {
    const errors: ValidationError[] = [];
    const { databaseConfig, appConfig } = context;

    if (!databaseConfig.databaseUrl) {
      errors.push({
        domain: 'DatabaseConfig',
        property: 'databaseUrl',
        reason: 'Database URL is missing.',
        severity: ValidationSeverity.CRITICAL,
        category: ValidationCategory.INFRASTRUCTURE,
        resolution: 'Provide DATABASE_URL environment variable.',
      });
      return errors;
    }

    if (appConfig.nodeEnv === Environment.Production) {
      const dbUrl = databaseConfig.databaseUrl.toLowerCase();
      if (dbUrl.includes('localhost') || dbUrl.includes('127.0.0.1')) {
        errors.push({
          domain: 'DatabaseConfig',
          property: 'databaseUrl',
          dependency: 'AppConfig.nodeEnv',
          reason: 'Production database should not point to localhost or 127.0.0.1.',
          severity: ValidationSeverity.CRITICAL,
          category: ValidationCategory.ENVIRONMENT,
          resolution: 'Update DATABASE_URL to point to a managed database instance (e.g., RDS, Cloud SQL).',
        });
      }
    }

    return errors;
  }
}
