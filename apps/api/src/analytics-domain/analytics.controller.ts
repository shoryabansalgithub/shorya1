import { Controller, Post, UseGuards } from '@nestjs/common';
import { AnalyticsJobScheduler } from './services/analytics-job.scheduler';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TenantGuard } from '../iam/guards/tenant.guard';

@UseGuards(JwtAuthGuard, TenantGuard)
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly scheduler: AnalyticsJobScheduler) {}

  /**
   * Endpoint for Admins/System to trigger a manual recalculation of the CQRS views.
   */
  @Post('trigger-daily')
  async triggerDailyAnalytics() {
    // Non-blocking trigger
    this.scheduler.runDailyAnalytics();
    return { status: 'ACCEPTED', message: 'Analytics generation started in background.' };
  }
}
