import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as levenshtein from 'fast-levenshtein';
import { Product, ProductVariant } from '@prisma/client';
import { ValidationFeatureConfig } from '../config/domains/features/validation-feature.config';

export interface DuplicateCheckContext {
  product: Product & { variants: ProductVariant[] };
}

@Injectable()
export class DuplicateDetectionEngine {
  private readonly logger = new Logger(DuplicateDetectionEngine.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly validationFeatureConfig: ValidationFeatureConfig
  ) {}

  /**
   * Scans existing products in the shop for highly similar duplicates.
   */
  async scanForDuplicates(shopId: string, context: DuplicateCheckContext) {
    const { product } = context;
    
    // 1. Fetch potential candidates (batching for performance)
    // We get products from the same category or brand, or just the whole shop if small.
    // For Enterprise, we'd use a pre-filtered Redis index. Here we use Prisma.
    const candidates = await this.prisma.product.findMany({
      where: {
        shopId,
        isDeleted: false,
        id: { not: product.id },
        OR: [
          { categoryId: product.categoryId },
          { brandId: product.brandId }
        ]
      },
      include: { variants: true },
      take: this.validationFeatureConfig.duplicateScanLimit, // Limit scan to prevent hanging
    });

    for (const candidate of candidates) {
      let score = 0;
      const reasons: string[] = [];

      // Exact SKU/Barcode match check across variants
      const contextSkus = product.variants.map(v => v.sku).filter(Boolean);
      const candidateSkus = candidate.variants.map(v => v.sku).filter(Boolean);
      const skuOverlap = contextSkus.some(sku => candidateSkus.includes(sku));

      if (skuOverlap) {
        score = 1.0;
        reasons.push('Exact SKU match found');
      } else {
        // Levenshtein fuzzy match on product name
        const distance = levenshtein.get(product.name.toLowerCase(), candidate.name.toLowerCase());
        const maxLength = Math.max(product.name.length, candidate.name.length);
        const nameSimilarity = 1 - (distance / maxLength);

        if (nameSimilarity > 0.85) {
          score = nameSimilarity;
          reasons.push(`Name similarity is ${(nameSimilarity * 100).toFixed(2)}%`);
        }
      }

      // If we crossed the threshold, mark as a candidate
      if (score >= 0.85) {
        await this.prisma.duplicateCandidate.upsert({
          where: {
            shopId_sourceId_targetId: {
              shopId,
              sourceId: product.id,
              targetId: candidate.id
            }
          },
          update: { score, reasons: JSON.stringify(reasons) },
          create: {
            shopId,
            sourceId: product.id,
            targetId: candidate.id,
            score,
            reasons: JSON.stringify(reasons),
          }
        });
      }
    }
  }
}
