import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TenantContextService } from '../../iam/tenant-context/tenant-context.service';
import { CreateWarehouseDto } from '../dto/warehouse.dto';

@Injectable()
export class WarehouseService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantContext: TenantContextService
  ) {}

  async create(dto: CreateWarehouseDto) {
    const shopId = this.tenantContext.getShopId();
    
    // Check code uniqueness
    const existing = await this.prisma.warehouse.findUnique({
      where: { shopId_code_deletedAt: { shopId, code: dto.code, deletedAt: null as any } }
    });
    if (existing) throw new BadRequestException(`Warehouse code ${dto.code} already exists.`);

    return this.prisma.warehouse.create({
      data: {
        ...dto,
        shopId
      }
    });
  }

  async findAll() {
    const shopId = this.tenantContext.getShopId();
    return this.prisma.warehouse.findMany({
      where: { shopId, isDeleted: false },
      orderBy: { createdAt: 'desc' }
    });
  }

  async findOne(id: string) {
    const shopId = this.tenantContext.getShopId();
    const warehouse = await this.prisma.warehouse.findFirst({
      where: { id, shopId, isDeleted: false }
    });
    if (!warehouse) throw new NotFoundException('Warehouse not found');
    return warehouse;
  }
}
