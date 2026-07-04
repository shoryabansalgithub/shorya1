import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PricingRuleEngine } from './pricing-rule-engine';
import { PricingSimulationContext, PricingSimulationResult } from '../dto/pricing-simulation.dto';
import { PricingRule } from '@prisma/client';

@Injectable()
export class PriceSimulationEngine {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ruleEngine: PricingRuleEngine
  ) {}

  /**
   * Simulates the exact enterprise price a customer will pay.
   */
  async simulate(context: PricingSimulationContext): Promise<PricingSimulationResult> {
    const { shopId, cartLines, coupons } = context;
    
    // 1. Fetch active global promotions & rules
    const activeRules = await this.prisma.pricingRule.findMany({
      where: {
        shopId,
        isActive: true
      }
    });

    // 2. Fetch active rules specifically tied to provided coupons
    let couponRules: PricingRule[] = [];
    if (coupons.length > 0) {
      const validCoupons = await this.prisma.coupon.findMany({
        where: {
          shopId,
          code: { in: coupons },
          isActive: true
        },
        include: {
          usages: true
        }
      });
      // Filter out coupons that exceed global limits
      const ruleIds = validCoupons
        .filter(c => c.usageLimit === null || c.usages.length < c.usageLimit)
        .map(c => c.pricingRuleId)
        .filter(id => id !== null) as string[];

      if (ruleIds.length > 0) {
        couponRules = await this.prisma.pricingRule.findMany({
          where: { id: { in: ruleIds } }
        });
      }
    }

    const allApplicableRules = [...activeRules, ...couponRules];

    // 3. Evaluate line by line
    let subTotal = 0;
    let grandTotal = 0;
    const processedLines = [];

    for (const line of cartLines) {
      const { finalUnitPrice, appliedDiscounts } = this.ruleEngine.applyRulesToLine(line, allApplicableRules);
      
      const lineTotal = finalUnitPrice * line.quantity;
      const lineSubTotal = line.basePrice * line.quantity;
      
      subTotal += lineSubTotal;
      grandTotal += lineTotal;

      processedLines.push({
        ...line,
        finalUnitPrice,
        lineTotal,
        appliedDiscounts
      });
    }

    return {
      lines: processedLines,
      subTotal,
      discountTotal: subTotal - grandTotal,
      grandTotal
    };
  }
}
