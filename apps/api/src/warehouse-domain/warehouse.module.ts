import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { WarehouseService } from './services/warehouse.service';
import { LocationHierarchyService } from './services/location-hierarchy.service';
import { WarehouseCapacityService } from './services/warehouse-capacity.service';
import { WarehouseValidationService } from './services/warehouse-validation.service';
import { WarehouseDomainController } from './warehouse-domain.controller';

@Module({
  imports: [PrismaModule],
  controllers: [WarehouseDomainController],
  providers: [
    WarehouseService,
    LocationHierarchyService,
    WarehouseCapacityService,
    WarehouseValidationService
  ],
  exports: [
    WarehouseService,
    LocationHierarchyService,
    WarehouseCapacityService
  ]
})
export class WarehouseModule {}
