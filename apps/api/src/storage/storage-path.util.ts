import { BadRequestException, InternalServerErrorException } from '@nestjs/common';
import * as path from 'path';
import {
  ALLOWED_FILE_EXTENSIONS,
  EXECUTABLE_EXTENSIONS,
  StorageCustomerDirectory,
} from './storage-security.constants';

const WINDOWS_DRIVE_PATTERN = /^[a-zA-Z]:/;
const SAFE_SEGMENT_PATTERN = /^[a-zA-Z0-9][a-zA-Z0-9 _.-]{0,127}$/;

function containsTraversal(raw: string): boolean {
  return raw
    .replace(/\\/g, '/')
    .split('/')
    .some((part) => part === '..' || part.includes('..'));
}

export function rejectUnsafePathInput(raw: string, label: string): void {
  if (!raw || raw.trim().length === 0) {
    throw new BadRequestException(`${label} is required`);
  }

  if (
    path.isAbsolute(raw) ||
    WINDOWS_DRIVE_PATTERN.test(raw) ||
    raw.includes('\0') ||
    containsTraversal(raw)
  ) {
    throw new BadRequestException(`${label} contains an unsafe path`);
  }
}

export function sanitizePathSegment(raw: string, label: string): string {
  rejectUnsafePathInput(raw, label);

  if (raw.includes('/') || raw.includes('\\')) {
    throw new BadRequestException(`${label} must be a single path segment`);
  }

  const normalized = raw.trim().replace(/[^a-zA-Z0-9 _.-]/g, '_');
  if (!SAFE_SEGMENT_PATTERN.test(normalized) || normalized.startsWith('.')) {
    throw new BadRequestException(`${label} contains invalid characters`);
  }

  return normalized.replace(/[ .]+$/g, '');
}

export function sanitizeCustomerName(customerName: string): string {
  const sanitized = sanitizePathSegment(customerName, 'customerName')
    .replace(/[^a-z0-9]/gi, '_')
    .replace(/_{2,}/g, '_')
    .replace(/^_|_$/g, '');

  if (!sanitized) {
    throw new BadRequestException('customerName is invalid');
  }

  return sanitized;
}

export function sanitizeStorageFileName(fileName: string): string {
  const sanitized = sanitizePathSegment(fileName, 'fileName');
  const ext = path.extname(sanitized).toLowerCase();

  if (!ext || EXECUTABLE_EXTENSIONS.has(ext)) {
    throw new BadRequestException('Executable or extensionless files are blocked');
  }

  if (!ALLOWED_FILE_EXTENSIONS.has(ext)) {
    throw new BadRequestException(`File extension ${ext} is not allowed`);
  }

  return sanitized;
}

export function normalizeDatePath(datePath: string): string {
  rejectUnsafePathInput(datePath, 'datePath');

  const parts = datePath.replace(/\\/g, '/').split('/');
  if (parts.length !== 2) {
    throw new BadRequestException('datePath must use the format YYYY/Month');
  }

  const [year, month] = parts;
  if (!/^\d{4}$/.test(year)) {
    throw new BadRequestException('datePath year must be four digits');
  }

  return path.join(
    sanitizePathSegment(year, 'datePath.year'),
    sanitizePathSegment(month, 'datePath.month'),
  );
}

export function resolveCustomerDirectory(
  rootFolder: string,
  customerName: string,
  directory: StorageCustomerDirectory,
): string {
  return safeJoin(rootFolder, 'Customers', sanitizeCustomerName(customerName), directory);
}

export function safeJoin(rootFolder: string, ...segments: string[]): string {
  const resolvedRoot = path.resolve(rootFolder);
  const resolvedTarget = path.resolve(resolvedRoot, ...segments);
  const relative = path.relative(resolvedRoot, resolvedTarget);

  // Final containment check: even if an upstream validator is bypassed,
  // filesystem operations are rejected unless the resolved target remains
  // inside the configured storage root.
  if (
    relative === '' ||
    (!relative.startsWith('..') && !path.isAbsolute(relative))
  ) {
    return resolvedTarget;
  }

  throw new InternalServerErrorException('Resolved path escaped storage root');
}
