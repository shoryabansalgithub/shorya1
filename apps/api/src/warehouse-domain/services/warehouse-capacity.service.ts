import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class WarehouseCapacityService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Validates if a location can handle additional weight and volume.
   */
  async checkCapacityBeforeAdd(locationId: string, shopId: string, addedWeightKg: number, addedVolumeM3: number) {
    const location = await this.prisma.location.findFirst({
      where: { id: locationId, shopId, isDeleted: false }
    });

    if (!location) throw new BadRequestException('Location not found');

    if (location.maxWeightKg) {
      const newWeight = location.currentWeightKg.toNumber() + addedWeightKg;
      if (newWeight > location.maxWeightKg.toNumber()) {
        throw new BadRequestException(`Capacity Error: Maximum weight exceeded for location ${location.code}`);
      }
    }

    if (location.maxVolumeM3) {
      const newVolume = location.currentVolumeM3.toNumber() + addedVolumeM3;
      if (newVolume > location.maxVolumeM3.toNumber()) {
        throw new BadRequestException(`Capacity Error: Maximum volume exceeded for location ${location.code}`);
      }
    }

    return true;
  }
}
