import * as path from 'path';
import { BadRequestException } from '@nestjs/common';
import { StorageCustomerDirectory } from './storage-security.constants';

const STORAGE_ROOT_ENV = process.env.STORAGE_ROOT || path.join(process.cwd(), 'data', 'storage');

export class StoragePathBuilder {
  private static sanitizeSegment(segment: string): string {
    if (!segment || typeof segment !== 'string') {
      throw new BadRequestException('Invalid path segment');
    }
    const sanitized = segment.replace(/[^a-zA-Z0-9_-]/g, '');
    if (!sanitized) {
      throw new BadRequestException('Path segment contains invalid characters');
    }
    return sanitized;
  }

  private static secureJoin(base: string, ...segments: string[]): string {
    const resolved = path.resolve(base, ...segments);
    // Anti-traversal check: The resolved path MUST still begin with the base path.
    if (!resolved.startsWith(base)) {
      throw new BadRequestException('Directory traversal detected');
    }
    return resolved;
  }

  /**
   * Root path for all data of a single tenant.
   * Format: data/storage/{shopId}
   */
  static getShopRoot(shopId: string): string {
    const safeShopId = this.sanitizeSegment(shopId);
    return this.secureJoin(STORAGE_ROOT_ENV, safeShopId);
  }

  /**
   * Path for a specific customer directory within a shop.
   * Format: data/storage/{shopId}/Customers/{customerId}/{category}
   */
  static getCustomerDirectory(shopId: string, customerId: string, category: StorageCustomerDirectory | 'Profile'): string {
    const safeCustomerId = this.sanitizeSegment(customerId);
    const shopRoot = this.getShopRoot(shopId);
    return this.secureJoin(shopRoot, 'Customers', safeCustomerId, category);
  }

  /**
   * Path for tenant-specific system files.
   * Format: data/storage/{shopId}/System/{filename}
   */
  static getSystemFile(shopId: string, filename: string): string {
    const safeFilename = filename.replace(/[^a-zA-Z0-9_.-]/g, '');
    const shopRoot = this.getShopRoot(shopId);
    return this.secureJoin(shopRoot, 'System', safeFilename);
  }

  /**
   * Path for tenant-specific logs.
   * Format: data/storage/{shopId}/Logs/{filename}
   */
  static getLogFile(shopId: string, filename: string): string {
    const safeFilename = filename.replace(/[^a-zA-Z0-9_.-]/g, '');
    const shopRoot = this.getShopRoot(shopId);
    return this.secureJoin(shopRoot, 'Logs', safeFilename);
  }

  /**
   * Path for tenant backups.
   * Format: data/storage/{shopId}/Backups/{type}
   */
  static getBackupDirectory(shopId: string, type: string): string {
    const safeType = this.sanitizeSegment(type);
    const shopRoot = this.getShopRoot(shopId);
    return this.secureJoin(shopRoot, 'Backups', safeType);
  }

  /**
   * Path for soft-deleted files.
   * Format: data/storage/{shopId}/Deleted/{targetFilename}
   */
  static getDeletedFileTarget(shopId: string, originalFilename: string): string {
    const timestamp = Date.now();
    const randomHex = Math.random().toString(16).substring(2, 8);
    // Allow dots for extension
    const safeOriginal = originalFilename.replace(/[^a-zA-Z0-9_.-]/g, '');
    const ext = path.extname(safeOriginal);
    const targetFilename = `${timestamp}-${randomHex}${ext}`;
    const shopRoot = this.getShopRoot(shopId);
    return this.secureJoin(shopRoot, 'Deleted', targetFilename);
  }

  /**
   * Prefix for all S3 keys belonging to this tenant.
   * Format: {shopId}/{folder}
   */
  static getS3Prefix(shopId: string, folder: string): string {
    const safeShopId = this.sanitizeSegment(shopId);
    const safeFolder = this.sanitizeSegment(folder);
    return `${safeShopId}/${safeFolder}`;
  }
}
