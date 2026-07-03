import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

import { TenantContextModule } from '../iam/tenant-context/tenant-context.module';

@Global()
@Module({
  imports: [TenantContextModule],
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
