import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger, Injectable } from '@nestjs/common';
import { ImportExecutionService } from './import-execution.service';

@Processor('import-job')
@Injectable()
export class ImportWorker extends WorkerHost {
  private readonly logger = new Logger(ImportWorker.name);

  constructor(
    private readonly importExecution: ImportExecutionService
  ) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    switch (job.name) {
      case 'process-import':
        this.logger.log(`Starting background import job ${job.data.jobId}`);
        await this.importExecution.processJob(job.data.jobId);
        break;
      default:
        this.logger.warn(`Unknown import job name: ${job.name}`);
    }
  }
}
