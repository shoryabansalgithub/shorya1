import { Injectable, Logger } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class CdnManagerService {
  private readonly logger = new Logger(CdnManagerService.name);
  
  // Using a local fallback strategy in this epic for the 'uploads' folder
  private readonly uploadDir = path.join(process.cwd(), 'uploads', 'media');

  constructor() {
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  /**
   * Generates a permanent storage location and moves the file there.
   */
  async persistLocal(tempFilePath: string, uniqueHash: string, extension: string): Promise<string> {
    const finalFileName = `${uniqueHash}.${extension}`;
    // Structure: uploads/media/xx/xxxx...
    const prefixDir = path.join(this.uploadDir, uniqueHash.substring(0, 2));
    
    if (!fs.existsSync(prefixDir)) {
      fs.mkdirSync(prefixDir, { recursive: true });
    }

    const finalPath = path.join(prefixDir, finalFileName);
    
    // Move the file from temp to final
    await fs.promises.rename(tempFilePath, finalPath);
    
    return finalPath;
  }

  /**
   * Transforms a local file path into a public URL.
   */
  generateCdnUrl(filePath: string): string {
    // Basic local CDN simulation for development
    // E.g., C:\...\uploads\media\a1\a123.png -> /static/media/a1/a123.png
    const relativePath = path.relative(this.uploadDir, filePath).replace(/\\/g, '/');
    return `/static/media/${relativePath}`;
  }
}
