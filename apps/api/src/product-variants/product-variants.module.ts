import { Module } from '@nestjs/common';
import { ProductVariantsController } from './product-variants.controller';
import { ProductVariantsService } from './product-variants.service';
import { PrismaModule } from '../prisma/prisma.module';
import { IamModule } from '../iam/iam.module';

@Module({
  imports: [PrismaModule, IamModule],
  controllers: [ProductVariantsController],
  providers: [ProductVariantsService],
  exports: [ProductVariantsService],
})
export class ProductVariantsModule {}
