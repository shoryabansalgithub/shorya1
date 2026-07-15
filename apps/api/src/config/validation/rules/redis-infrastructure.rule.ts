import { Injectable } from '@nestjs/common';
import { ValidationRule } from '../interfaces/validation-rule.interface';
import { ValidationContext } from '../validation.context';
import { ValidationError } from '../interfaces/validation-error.interface';
import { ValidationSeverity } from '../enums/validation-severity.enum';
import { ValidationCategory } from '../enums/validation-category.enum';
import { RedisConfig } from '../../domains/redis.config';
import { RuleDependencies } from '../../registry/registry.decorators';

@Injectable()
@RuleDependencies([RedisConfig])
export class RedisInfrastructureRule implements ValidationRule {
  validate(context: ValidationContext): ValidationError[] {
    const errors: ValidationError[] = [];
    const { redisConfig } = context;

    if (!redisConfig.redisUrl) {
      errors.push({
        domain: 'RedisConfig',
        property: 'redisUrl',
        reason: 'Redis URL is missing. BullMQ, Caching, and global PubSub require Redis to function in an Enterprise context.',
        severity: ValidationSeverity.CRITICAL,
        category: ValidationCategory.INFRASTRUCTURE,
        resolution: 'Provide REDIS_URL environment variable.',
      });
    }

    return errors;
  }
}
