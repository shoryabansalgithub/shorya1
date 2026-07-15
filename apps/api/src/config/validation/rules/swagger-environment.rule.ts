import { Injectable } from '@nestjs/common';
import { ValidationRule } from '../interfaces/validation-rule.interface';
import { ValidationContext } from '../validation.context';
import { ValidationCategory } from '../enums/validation-category.enum';
import { ValidationError } from '../interfaces/validation-error.interface';
import { ValidationSeverity } from '../enums/validation-severity.enum';
import { Environment, AppConfig } from '../../domains/app.config';
import { SwaggerConfig } from '../../domains/swagger.config';
import { RuleDependencies } from '../../registry/registry.decorators';
@Injectable()
@RuleDependencies([SwaggerConfig, AppConfig])
export class SwaggerEnvironmentRule implements ValidationRule {
  validate(context: ValidationContext): ValidationError[] {
    const errors: ValidationError[] = [];
    const { swaggerConfig, appConfig } = context;

    if (swaggerConfig.enabled && appConfig.nodeEnv === Environment.Production) {
      errors.push({
        domain: 'SwaggerConfig',
        property: 'enabled',
        dependency: 'AppConfig.nodeEnv',
        reason: 'Swagger documentation should not be enabled in production environments due to security risks.',
        severity: ValidationSeverity.WARNING,
        category: ValidationCategory.ENVIRONMENT,
        resolution: 'Set SWAGGER_ENABLED=false in production or ensure it is strictly authenticated.',
      });
    }

    return errors;
  }
}
