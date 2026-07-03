import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TenantContextService } from '../iam/tenant-context/tenant-context.service';

@Injectable()
export class ProductVariantsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantContext: TenantContextService,
  ) {}

  async createAttribute(name: string, values: string[]) {
    const shopId = this.tenantContext.getShopId();
    const slug = name.toLowerCase().replace(/[^a-z0-9]/g, '-');

    return this.prisma.$transaction(async (tx) => {
        let attribute = await tx.variantAttribute.findUnique({
            where: { shopId_slug: { shopId, slug } }
        });

        if (!attribute) {
            attribute = await tx.variantAttribute.create({
                data: { shopId, name, slug }
            });
        }

        const createdValues = [];
        for (const val of values) {
            const valSlug = val.toLowerCase().replace(/[^a-z0-9]/g, '-');
            const attrVal = await tx.variantAttributeValue.upsert({
                where: { attributeId_slug: { attributeId: attribute.id, slug: valSlug } },
                update: {},
                create: { attributeId: attribute.id, value: val, slug: valSlug }
            });
            createdValues.push(attrVal);
        }

        return { attribute, values: createdValues };
    });
  }

  async generateVariants(productId: string, attributes: { [key: string]: string[] }) {
      const shopId = this.tenantContext.getShopId();
      
      const product = await this.prisma.product.findFirst({
          where: { id: productId, shopId, isDeleted: false }
      });
      if (!product) throw new NotFoundException('Product not found');

      // Cartesian product logic
      const keys = Object.keys(attributes);
      const valuesArray = keys.map(k => attributes[k]);

      const cartesian = (...a: any[]) => a.reduce((a, b) => a.flatMap((d: any) => b.map((e: any) => [d, e].flat())));
      const combinations = valuesArray.length > 1 ? cartesian(...valuesArray) : valuesArray[0].map(v => [v]);

      const createdVariants = [];

      for (const combination of combinations) {
          const comboValues = Array.isArray(combination) ? combination : [combination];
          
          // Generate SKU suffix
          const skuSuffix = comboValues.map(v => v.substring(0, 3).toUpperCase()).join('-');
          const variantSku = `${product.sku}-${skuSuffix}`;

          const variant = await this.prisma.productVariant.upsert({
              where: { shopId_sku_isDeleted: { shopId, sku: variantSku, isDeleted: false } },
              update: {},
              create: {
                  productId,
                  shopId,
                  sku: variantSku,
                  costPrice: product.costPrice,
                  sellingPrice: product.sellingPrice,
                  mrp: product.mrp,
              }
          });

          // Link attributes
          for (let i = 0; i < keys.length; i++) {
              const attrName = keys[i];
              const attrVal = comboValues[i];
              
              const { values } = await this.createAttribute(attrName, [attrVal]);
              
              await this.prisma.productVariantAttribute.upsert({
                  where: {
                      variantId_attributeValueId: {
                          variantId: variant.id,
                          attributeValueId: values[0].id
                      }
                  },
                  update: {},
                  create: {
                      variantId: variant.id,
                      attributeValueId: values[0].id
                  }
              });
          }

          createdVariants.push(variant);
      }

      // Update product type to VARIABLE
      await this.prisma.product.update({
          where: { id: productId },
          data: { type: 'VARIABLE' }
      });

      return createdVariants;
  }
}
