import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class CustomerRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    data: Prisma.CustomerCreateInput | Prisma.CustomerUncheckedCreateInput,
  ) {
    return this.prisma.customer.create({ data });
  }

  async findById(id: string, shopId: string) {
    return this.prisma.customer.findFirst({
      where: { id, shopId, isDeleted: false },
      include: {
        profile: true,
        addresses: true,
        contacts: true,
        groups: { include: { group: true } },
        categories: { include: { category: true } },
        customerTags: { include: { tag: true } }
      }
    });
  }

  async findAll(shopId: string, skip?: number, take?: number) {
    return this.prisma.customer.findMany({
      where: { shopId, isDeleted: false },
      skip,
      take,
      include: { profile: true },
      orderBy: { createdAt: 'desc' }
    });
  }

  async update(id: string, shopId: string, data: Prisma.CustomerUpdateInput) {
    return this.prisma.customer.update({
      where: { id },
      data
    });
  }

  async softDelete(id: string, shopId: string) {
    return this.prisma.customer.update({
      where: { id },
      data: { isDeleted: true, deletedAt: new Date() }
    });
  }
}
