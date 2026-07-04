import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ValidationSeverity } from '@prisma/client';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject } from '@nestjs/common';
import type { Cache } from 'cache-manager';

export interface ValidationRuleConfig {
  id: string;
  ruleKey: string;
  isEnabled: boolean;
  severity: ValidationSeverity;
  config: any;
}

@Injectable()
export class ValidationRuleEngine {
  private readonly logger = new Logger(ValidationRuleEngine.name);

  constructor(
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  /**
   * Retrieves active validation rules for a shop.
   * Leverages Redis cache for high performance.
   */
  async getActiveRules(shopId: string): Promise<ValidationRuleConfig[]> {
    const cacheKey = `validation_rules:${shopId}`;
    const cached = await this.cacheManager.get<ValidationRuleConfig[]>(cacheKey);
    
    if (cached) {
      return cached;
    }

    const rules = await this.prisma.validationRule.findMany({
      where: { shopId, isEnabled: true },
    });

    const mappedRules = rules.map(r => ({
      id: r.id,
      ruleKey: r.ruleKey,
      isEnabled: r.isEnabled,
      severity: r.severity,
      config: r.config,
    }));

    // Cache rules for 15 minutes
    await this.cacheManager.set(cacheKey, mappedRules, 1000 * 60 * 15);
    
    return mappedRules;
  }

  /**
   * Evaluates if a specific rule should block a pipeline execution based on severity.
   */
  isBlocking(severity: ValidationSeverity): boolean {
    return severity === 'BLOCKING' || severity === 'CRITICAL';
  }
}
