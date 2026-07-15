import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { SecurityConfig } from './security.config';
import { BullConfig } from './bull.config';
import { SalesFeatureConfig } from './features/sales-feature.config';
import { CacheConfig } from './cache.config';

describe('Configuration Domains', () => {
  describe('SecurityConfig', () => {
    it('should hydrate defaults correctly when no env variables are provided', () => {
      const config = plainToInstance(SecurityConfig, {}, { enableImplicitConversion: true });
      expect(config.bcryptRounds).toBe(10);
      expect(config.rateLimitShortTtl).toBe(1000);
      expect(config.maxLoginAttempts).toBe(5);
    });

    it('should hydrate values correctly from environment variables', () => {
      const env = {
        BCRYPT_ROUNDS: '12',
        RATE_LIMIT_SHORT_TTL: '2000',
        SECURITY_MAX_LOGIN_ATTEMPTS: '10',
      };
      const config = plainToInstance(SecurityConfig, env, { enableImplicitConversion: true });
      expect(config.bcryptRounds).toBe(12);
      expect(config.rateLimitShortTtl).toBe(2000);
      expect(config.maxLoginAttempts).toBe(10);
    });

    it('should pass validation with valid values', () => {
      const config = plainToInstance(SecurityConfig, {}, { enableImplicitConversion: true });
      const errors = validateSync(config);
      expect(errors.length).toBe(0);
    });
  });

  describe('BullConfig', () => {
    it('should hydrate defaults correctly', () => {
      const config = plainToInstance(BullConfig, {}, { enableImplicitConversion: true });
      expect(config.defaultAttempts).toBe(3);
      expect(config.backoffType).toBe('exponential');
      expect(config.backoffDelay).toBe(1000);
      expect(config.removeOnComplete).toBe(true);
      expect(config.removeOnFail).toBe(false);
    });

    it('should hydrate custom boolean strings correctly', () => {
      const env = {
        BULL_REMOVE_ON_COMPLETE: 'false',
        BULL_REMOVE_ON_FAIL: 'true',
      };
      const config = plainToInstance(BullConfig, env, { enableImplicitConversion: false });
      expect(config.removeOnComplete).toBe(false);
      expect(config.removeOnFail).toBe(true);
    });
  });

  describe('SalesFeatureConfig', () => {
    it('should hydrate default feature flags and settings', () => {
      const config = plainToInstance(SalesFeatureConfig, {}, { enableImplicitConversion: true });
      expect(config.defaultPaginationLimit).toBe(50);
      expect(config.recentEventsLimit).toBe(100);
      expect(config.creditHoldThreshold).toBe(10000);
      expect(config.defaultCreditLimit).toBe(5000);
    });

    it('should override features from env', () => {
      const env = {
        SALES_DEFAULT_PAGINATION_LIMIT: '100',
        SALES_DEFAULT_CREDIT_LIMIT: '10000',
        SALES_CREDIT_HOLD_THRESHOLD: '15000',
      };
      const config = plainToInstance(SalesFeatureConfig, env, { enableImplicitConversion: true });
      expect(config.defaultPaginationLimit).toBe(100);
      expect(config.defaultCreditLimit).toBe(10000);
      expect(config.creditHoldThreshold).toBe(15000);
    });

    it('should flag validation error on negative credit limits', () => {
      const env = {
        SALES_DEFAULT_CREDIT_LIMIT: '-100', // invalid because of @Min(0)
      };
      const config = plainToInstance(SalesFeatureConfig, env, { enableImplicitConversion: true });
      const errors = validateSync(config);
      expect(errors.length).toBeGreaterThan(0);
      const creditLimitError = errors.find(e => e.property === 'defaultCreditLimit');
      expect(creditLimitError).toBeDefined();
    });
  });

  describe('CacheConfig', () => {
    it('should hydrate from defaults', () => {
      const config = plainToInstance(CacheConfig, {}, { enableImplicitConversion: true });
      expect(config.ttl).toBe(3600000);
      expect(config.maxItems).toBe(1000);
    });
  });
});
