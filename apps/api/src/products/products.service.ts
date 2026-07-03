import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TenantContextService } from '../iam/tenant-context/tenant-context.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/create-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantContext: TenantContextService,
  ) {}

  async create(createProductDto: CreateProductDto) {
    const shopId = this.tenantContext.getShopId();
    
    // Check for SKU uniqueness within shop
    const existing = await this.prisma.product.findUnique({
      where: {
        shopId_sku_deletedAt: {
          shopId,
          sku: createProductDto.sku,
          deletedAt: null as any // Using Prisma's unique null behavior (actually prisma unique ignores nulls in some DBs, but DukanAI uses a composite key with deletedAt)
        }
      }
    });

    if (existing && !existing.isDeleted) {
        // FindFirst is safer for checking active SKUs
        const activeExisting = await this.prisma.product.findFirst({
            where: { shopId, sku: createProductDto.sku, isDeleted: false }
        });
        if (activeExisting) {
            throw new BadRequestException(`Product with SKU ${createProductDto.sku} already exists.`);
        }
    }

    const product = await this.prisma.product.create({
      data: {
        ...createProductDto,
        shopId,
      },
    });

    // TODO: Publish ProductCreated event to Outbox
    
    return product;
  }

  async findAll() {
    const shopId = this.tenantContext.getShopId();
    return this.prisma.product.findMany({
      where: { shopId, isDeleted: false },
      include: { category: true, brand: true },
      orderBy: { createdAt: 'desc' }
    });
  }

  async findOne(id: string) {
    const shopId = this.tenantContext.getShopId();
    const product = await this.prisma.product.findFirst({
      where: { id, shopId, isDeleted: false },
      include: { category: true, brand: true, variants: true, images: true, attributes: true }
    });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    const shopId = this.tenantContext.getShopId();
    
    const product = await this.prisma.product.findFirst({
      where: { id, shopId, isDeleted: false }
    });
    if (!product) throw new NotFoundException('Product not found');

    // Rule 1 & 4 & 9: Backward compatibility.
    // Instead of complex versioning here initially, we just do a direct update.
    // Epic 3 Versioning will be handled in ProductVersioningService.

    return this.prisma.product.update({
      where: { id },
      data: updateProductDto
    });
  }

  async softDelete(id: string) {
    const shopId = this.tenantContext.getShopId();
    const product = await this.prisma.product.findFirst({
      where: { id, shopId, isDeleted: false }
    });
    if (!product) throw new NotFoundException('Product not found');

    return this.prisma.product.update({
      where: { id },
      data: { 
        isDeleted: true,
        deletedAt: new Date(),
        status: 'SOFT_DELETED'
      }
    });
  }
}
