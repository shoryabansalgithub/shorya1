import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { TenantContextService } from '../iam/tenant-context/tenant-context.service';
import { tenantExtension } from './prisma-tenant.extension';
import { AppConfig, Environment } from '../config/domains/app.config';
import { PrismaConfig } from '../config/domains/prisma.config';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor(
    private readonly tenantContextService: TenantContextService,
    appConfig: AppConfig,
    prismaConfig: PrismaConfig,
  ) {
    const isProduction = appConfig.nodeEnv === Environment.Production;
    const logLevels = isProduction
      ? (prismaConfig.logLevelProduction || ['warn', 'error'])
      : (prismaConfig.logLevelDevelopment || ['query', 'info', 'warn', 'error']);

    super({
      log: logLevels.map(level => ({ emit: 'stdout', level })) as any,
    });

    const extended = this.$extends(tenantExtension(this.tenantContextService));

    return new Proxy(this, {
      get: (target, prop) => {
        if (prop in extended) {
          return extended[prop as keyof typeof extended];
        }
        return target[prop as keyof typeof target];
      }
    });
  }

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('Database connection established');
    } catch (error) {
      this.logger.error('Failed to connect to database', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log('Database connection closed');
  }
}
