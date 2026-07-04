import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Gs1EngineService } from './gs1-engine.service';
import { BarcodeGeneratorService } from './barcode-generator.service';
import { IdentityAuditService } from './identity-audit.service';
import { BarcodeFormat, BarcodeStatus } from '@prisma/client';

@Injectable()
export class ProductIdentityService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly gs1Engine: Gs1EngineService,
    private readonly barcodeGenerator: BarcodeGeneratorService,
    private readonly identityAudit: IdentityAuditService,
  ) {}

  /**
   * Generates or assigns a barcode to a Product/Variant/Package.
   */
  async generateBarcode(params: {
    shopId: string;
    code: string;
    format: BarcodeFormat;
    productId?: string;
    variantId?: string;
    packageId?: string;
    userId: string;
  }) {
    const { shopId, code, format, productId, variantId, packageId, userId } = params;

    // Validate format
    if (['EAN13', 'UPCA', 'EAN8'].includes(format)) {
      if (!this.gs1Engine.validate(code)) {
        throw new BadRequestException(`Invalid GS1 Check Digit for ${format}`);
      }
    }

    // Check uniqueness within the shop
    const existing = await this.prisma.barcode.findUnique({
      where: { shopId_code: { shopId, code } },
    });

    if (existing) {
      throw new ConflictException(`Barcode ${code} already exists in this organization`);
    }

    // Ensure the identity wrapper exists (e.g. ProductIdentity)
    if (productId) {
      await this.ensureProductIdentityExists(shopId, productId);
    }
    if (variantId) {
      await this.ensureVariantIdentityExists(shopId, variantId);
    }

    // Create the barcode
    const barcode = await this.prisma.barcode.create({
      data: {
        shopId,
        code,
        format,
        status: BarcodeStatus.ACTIVE,
        productId,
        variantId,
        packageId,
        isPrimary: true, // simplified logic, in reality we'd toggle old ones
      },
    });

    // Record audit history for the creation
    await this.identityAudit.recordBarcodeChange(
      shopId,
      barcode.id,
      null,
      code,
      'INITIAL_GENERATION',
      userId,
    );

    return barcode;
  }

  private async ensureProductIdentityExists(shopId: string, productId: string) {
    const exists = await this.prisma.productIdentity.findUnique({ where: { productId } });
    if (!exists) {
      await this.prisma.productIdentity.create({
        data: { shopId, productId },
      });
    }
  }

  private async ensureVariantIdentityExists(shopId: string, variantId: string) {
    const exists = await this.prisma.variantIdentity.findUnique({ where: { variantId } });
    if (!exists) {
      const variant = await this.prisma.productVariant.findUnique({ where: { id: variantId } });
      if (!variant) throw new NotFoundException('Variant not found');
      await this.prisma.variantIdentity.create({
        data: { shopId, variantId, sku: variant.sku },
      });
    }
  }

  /**
   * Universal Search for Barcode/SKU.
   */
  async searchIdentity(shopId: string, query: string) {
    // 1. Exact Barcode Match
    const exactBarcode = await this.prisma.barcode.findUnique({
      where: { shopId_code: { shopId, code: query } },
      include: {
        product: true,
        variant: true,
        package: true,
      },
    });

    if (exactBarcode) return exactBarcode;

    // 2. Exact SKU Match (Variant)
    const exactSku = await this.prisma.variantIdentity.findUnique({
      where: { sku: query, shopId },
      include: { variant: { include: { product: true } } },
    });

    if (exactSku) return exactSku;

    // 3. Historical Barcode Search
    const historical = await this.prisma.barcodeHistory.findFirst({
      where: { shopId, oldCode: query },
      orderBy: { createdAt: 'desc' },
      include: {
        barcode: {
          include: { product: true, variant: true },
        },
      },
    });

    if (historical) return historical.barcode;

    throw new NotFoundException(`Identity not found for query: ${query}`);
  }
}
