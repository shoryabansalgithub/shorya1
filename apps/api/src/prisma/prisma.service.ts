import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { TenantContextService } from '../iam/tenant-context/tenant-context.service';
import { tenantExtension } from './prisma-tenant.extension';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor(private readonly tenantContextService: TenantContextService) {
    const isProduction = process.env.NODE_ENV === 'production';
    super({
      log: isProduction
        ? [
            { emit: 'stdout', level: 'warn' },
            { emit: 'stdout', level: 'error' },
          ]
        : [
            { emit: 'stdout', level: 'query' },
            { emit: 'stdout', level: 'info' },
            { emit: 'stdout', level: 'warn' },
            { emit: 'stdout', level: 'error' },
          ],
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
