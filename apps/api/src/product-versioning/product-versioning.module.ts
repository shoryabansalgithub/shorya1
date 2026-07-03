import { Module } from '@nestjs/common';
import { ProductVersioningService } from './product-versioning.service';
import { ProductVersioningController } from './product-versioning.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { IamModule } from '../iam/iam.module';

@Module({
  imports: [PrismaModule, IamModule],
  controllers: [ProductVersioningController],
  providers: [ProductVersioningService],
  exports: [ProductVersioningService],
})
export class ProductVersioningModule {}
