import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class WorkflowEscalationService {
  private readonly logger = new Logger(WorkflowEscalationService.name);

  async checkSlaViolations() {
    this.logger.debug('Checking SLA Violations across all pending tasks...');
    // Handled by BullMQ processor on cron
  }
}
