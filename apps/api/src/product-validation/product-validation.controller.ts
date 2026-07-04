import { Controller, Post, Get, Body, Param, UseGuards, Req, BadRequestException } from '@nestjs/common';
import { ProductValidationService } from './product-validation.service';
import { ValidationRuleEngine } from './validation-rule.engine';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TenantGuard } from '../iam/guards/tenant.guard';

@UseGuards(JwtAuthGuard, TenantGuard)
@Controller('products')
export class ProductValidationController {
  constructor(
    private readonly validationService: ProductValidationService,
    private readonly ruleEngine: ValidationRuleEngine,
  ) {}

  @Post(':id/validate')
  async validateProduct(@Param('id') productId: string, @Req() req: any) {
    // Synchronous execution for immediate feedback
    return this.validationService.executeValidation(req.shop.id, productId);
  }

  @Post('bulk-validation')
  async bulkValidate(@Body() body: { productIds: string[] }, @Req() req: any) {
    if (!body.productIds || body.productIds.length === 0) {
      throw new BadRequestException('Provide at least one productId');
    }
    
    // Async execution for bulk
    for (const id of body.productIds) {
      await this.validationService.queueValidation(req.shop.id, id);
    }

    return { message: `Validation queued for ${body.productIds.length} products` };
  }

  @Get(':id/quality')
  async getQualityScore(@Param('id') productId: string, @Req() req: any) {
    const state = await this.validationService.getValidationState(req.shop.id, productId);
    return state.score || { score: 0, missingFields: [], suggestions: [] };
  }

  @Get(':id/issues')
  async getValidationIssues(@Param('id') productId: string, @Req() req: any) {
    const state = await this.validationService.getValidationState(req.shop.id, productId);
    return state.issues;
  }

  @Get('validation/rules')
  async getRules(@Req() req: any) {
    return this.ruleEngine.getActiveRules(req.shop.id);
  }
}

