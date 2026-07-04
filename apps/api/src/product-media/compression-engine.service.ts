import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class CompressionEngineService {
  private readonly logger = new Logger(CompressionEngineService.name);

  constructor(
    @InjectQueue('media-processing') private readonly mediaQueue: Queue
  ) {}

  /**
   * Dispatches a job to asynchronously generate thumbnails (WEBP, AVIF)
   * and extract metadata.
   */
  async queueImageProcessing(assetId: string, shopId: string, filePath: string) {
    this.logger.log(`Dispatching image processing for asset ${assetId}`);
    await this.mediaQueue.add('generate-thumbnails', {
      assetId,
      shopId,
      filePath,
    });
  }

  /**
   * Dispatches a job to process video files (metadata, previews).
   */
  async queueVideoProcessing(assetId: string, shopId: string, filePath: string) {
    this.logger.log(`Dispatching video processing for asset ${assetId}`);
    await this.mediaQueue.add('process-video', {
      assetId,
      shopId,
      filePath,
    });
  }
}
