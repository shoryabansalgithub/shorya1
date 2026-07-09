import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { PrismaModule } from '../prisma/prisma.module';
import { IamModule } from '../iam/iam.module';
import { ProductEventsModule } from '../product-events/product-events.module';

@Module({
  imports: [PrismaModule, IamModule, ProductEventsModule],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}
