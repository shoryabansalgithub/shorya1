import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class WarehouseValidationService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Ensure that moving a location doesn't create a circular reference
   * (e.g. moving Zone A to be a child of Aisle 1, which is already a child of Zone A).
   */
  async validateNoCircularReference(locationId: string, newParentId: string, shopId: string) {
    if (locationId === newParentId) throw new BadRequestException('A location cannot be its own parent.');

    const newParent = await this.prisma.location.findFirst({
      where: { id: newParentId, shopId, isDeleted: false }
    });

    if (!newParent) throw new BadRequestException('Target parent not found.');

    const locationToMove = await this.prisma.location.findFirst({
      where: { id: locationId, shopId, isDeleted: false }
    });

    if (!locationToMove) throw new BadRequestException('Location not found.');

    // Because of Materialized Path, checking circular reference is an O(1) string check!
    // If the new parent's path starts with the location's current path, it's circular.
    if (newParent.path.startsWith(locationToMove.path + '/')) {
      throw new BadRequestException('Circular hierarchy detected. Cannot move a parent into its own descendant.');
    }
  }
}
