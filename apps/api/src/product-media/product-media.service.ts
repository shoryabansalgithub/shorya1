import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UploadEngineService, UploadedFile } from './upload-engine.service';
import { DeduplicationService } from './deduplication.service';
import { CdnManagerService } from './cdn-manager.service';
import { CompressionEngineService } from './compression-engine.service';
import * as path from 'path';

@Injectable()
export class ProductMediaService {
  private readonly logger = new Logger(ProductMediaService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly uploadEngine: UploadEngineService,
    private readonly dedup: DeduplicationService,
    private readonly cdn: CdnManagerService,
    private readonly compression: CompressionEngineService,
  ) {}

  /**
   * Main entry point for uploading a new media asset.
   */
  async uploadMedia(
    shopId: string, 
    userId: string,
    file: UploadedFile, 
    productId?: string, 
    variantId?: string,
    isPrimary: boolean = false
  ) {
    // 1. Validate constraints
    this.uploadEngine.validateFile(file);

    // 2. Temporarily write file to disk
    const tempPath = await this.uploadEngine.storeLocalTemporarily(file);

    // 3. Calculate Deduplication Hash
    const hash = await this.dedup.calculateFileHash(tempPath);

    // 4. Check for existing exact matches
    let asset = await this.dedup.findExistingAsset(shopId, hash);

    if (!asset) {
      // 5. Move to permanent CDN/Storage
      const extension = path.extname(file.originalname).slice(1) || 'bin';
      const finalPath = await this.cdn.persistLocal(tempPath, hash, extension);
      const cdnUrl = this.cdn.generateCdnUrl(finalPath);
      
      // Determine MediaType
      const mediaType = file.mimetype.startsWith('video/') ? 'VIDEO' : 
                        file.mimetype.startsWith('image/') ? 'IMAGE' : 'DOCUMENT';

      // 6. Create Asset Record
      asset = await this.prisma.mediaAsset.create({
        data: {
          shopId,
          hash,
          mimeType: file.mimetype,
          extension,
          sizeBytes: file.size,
          originalName: file.originalname,
          status: 'PUBLISHED',
        },
      });

      // 7. Store Storage Reference
      await this.prisma.mediaStorage.create({
        data: {
          shopId,
          assetId: asset.id,
          provider: 'LOCAL',
          path: finalPath,
          cdnUrl,
        },
      });

      // 8. Queue Background Processing (Thumbnails / Video extraction)
      if (mediaType === 'IMAGE') {
        await this.compression.queueImageProcessing(asset.id, shopId, finalPath);
      } else if (mediaType === 'VIDEO') {
        await this.compression.queueVideoProcessing(asset.id, shopId, finalPath);
      }
    } else {
      this.logger.log(`Asset ${hash} deduplicated. Proceeding to create references.`);
      // If it's a deduplicated file, the temporary file is no longer needed, but typically we'd delete it.
      // E.g., await fs.promises.unlink(tempPath);
    }

    // 9. Bind Reference if applicable
    if (productId || variantId) {
      await this.prisma.mediaReference.create({
        data: {
          shopId,
          assetId: asset.id,
          productId,
          variantId,
          isPrimary,
        },
      });
    }

    // 10. Audit log
    await this.prisma.mediaAudit.create({
      data: {
        shopId,
        assetId: asset.id,
        userId,
        action: 'UPLOAD',
      },
    });

    return asset;
  }

  /**
   * Retrieves full gallery for a given product/variant.
   */
  async getGallery(shopId: string, productId?: string, variantId?: string) {
    if (!productId && !variantId) throw new NotFoundException('Must provide productId or variantId');
    
    return this.prisma.mediaReference.findMany({
      where: {
        shopId,
        productId,
        variantId,
      },
      include: {
        asset: {
          include: {
            metadata: true,
            storage: true,
            thumbanils: true, // Note spelling
            tags: true,
          },
        },
      },
      orderBy: { sortOrder: 'asc' },
    });
  }
}
