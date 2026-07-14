import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { JwtConfig } from '../config/domains/jwt.config';
import { InventoryGateway } from './inventory.gateway';
import { InventoryCacheService } from './inventory-cache.service';
import { InventoryService } from './inventory.service';
import { InventoryController } from './inventory.controller';
import { InventoryReconService } from './inventory-recon.service';
import { DriftAlertService } from './drift-alert.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    JwtModule.registerAsync({
      inject: [JwtConfig],
      useFactory: (jwtConfig: JwtConfig) => ({
        secret: jwtConfig.jwtSecret,
      }),
    }),
  ],
  controllers: [InventoryController],
  providers: [InventoryGateway, InventoryCacheService, InventoryService, InventoryReconService, DriftAlertService],
  exports: [InventoryGateway, InventoryCacheService, InventoryService, DriftAlertService],
})
export class InventoryModule {}
