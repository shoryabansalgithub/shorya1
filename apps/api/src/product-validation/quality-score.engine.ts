import { Injectable, Logger } from '@nestjs/common';
import { Product, ProductVariant, MediaReference } from '@prisma/client';

export interface ScoreContext {
  product: Product & { 
    variants: ProductVariant[];
    mediaReferences: MediaReference[];
  };
}

export interface ScoreResult {
  score: number;
  missingFields: string[];
  suggestions: string[];
}

@Injectable()
export class QualityScoreEngine {
  private readonly logger = new Logger(QualityScoreEngine.name);

  /**
   * Calculates the product quality score (0-100) dynamically.
   */
  calculateScore(context: ScoreContext): ScoreResult {
    const { product } = context;
    let score = 0;
    const missingFields: string[] = [];
    const suggestions: string[] = [];

    // 1. Basic Info (Max 20)
    if (product.name && product.name.length > 3) {
      score += 10;
    } else {
      missingFields.push('name');
      suggestions.push('Add a descriptive product name');
    }

    if (product.categoryId) {
      score += 5;
    } else {
      missingFields.push('categoryId');
      suggestions.push('Assign the product to a category');
    }

    if (product.brandId) {
      score += 5;
    } else {
      missingFields.push('brandId');
      suggestions.push('Assign a brand to increase visibility');
    }

    // 2. Images (Max 20)
    if (product.mediaReferences && product.mediaReferences.length > 0) {
      score += 10;
      if (product.mediaReferences.length >= 3) {
        score += 10;
      } else {
        suggestions.push('Upload at least 3 images for better conversion rates');
      }
    } else {
      missingFields.push('mediaReferences');
      suggestions.push('Upload a primary product image');
    }

    // 3. Pricing (Max 20)
    const primaryVariant = product.variants[0];
    if (primaryVariant) {
      if (primaryVariant.sellingPrice) {
        score += 10;
      } else {
        missingFields.push('sellingPrice');
        suggestions.push('Set a selling price');
      }

      if (primaryVariant.mrp && Number(primaryVariant.mrp) >= Number(primaryVariant.sellingPrice)) {
        score += 10;
      } else {
        suggestions.push('Ensure MRP is greater than or equal to selling price');
      }
    } else {
      missingFields.push('variants');
      suggestions.push('Create at least one variant');
    }

    // 4. Barcodes & Identifiers (Max 20)
    if (primaryVariant && primaryVariant.sku) {
      score += 10;
    } else {
      missingFields.push('sku');
      suggestions.push('Set a unique SKU');
    }

    if (primaryVariant && primaryVariant.barcode) {
      score += 10;
    } else {
      suggestions.push('Assign an EAN/UPC barcode for easy scanning');
    }

    // 5. SEO & Details (Max 20)
    if (product.searchKeywords && product.searchKeywords.length > 0) {
      score += 10;
    } else {
      suggestions.push('Add search keywords for better discovery');
    }

    if (product.aliases && product.aliases.length > 0) {
      score += 10;
    } else {
      suggestions.push('Add aliases if the product is known by other names');
    }

    return {
      score: Math.min(100, Math.max(0, score)),
      missingFields,
      suggestions
    };
  }
}
