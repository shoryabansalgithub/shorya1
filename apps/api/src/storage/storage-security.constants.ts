export enum StorageCustomerDirectory {
  Invoices = 'Invoices',
  Bills = 'Bills',
  OriginalPhotos = 'Original_Photos',
  PDFs = 'PDFs',
  OCR = 'OCR',
  Payments = 'Payments',
  Statements = 'Statements',
  Notes = 'Notes',
}

export enum BackupType {
  Daily = 'Daily',
  Weekly = 'Weekly',
  Monthly = 'Monthly',
}

export enum CloudUploadFolder {
  Products = 'products',
  Logos = 'logos',
  General = 'general',
}

export const CUSTOMER_SUBDIRECTORIES = [
  'Profile',
  ...Object.values(StorageCustomerDirectory),
  'Backups',
  'Deleted',
] as const;

export const ROOT_SUBDIRECTORIES = [
  'Customers',
  'Database',
  'System',
  'Backups/Daily',
  'Backups/Weekly',
  'Backups/Monthly',
  'Cache/Thumbnails',
  'Temp',
  'Archive',
  'Logs',
  'Deleted',
] as const;

export const EXECUTABLE_EXTENSIONS = new Set([
  '.bat',
  '.cmd',
  '.com',
  '.dll',
  '.exe',
  '.js',
  '.jar',
  '.msi',
  '.ps1',
  '.scr',
  '.sh',
  '.vbs',
]);

export const ALLOWED_FILE_EXTENSIONS = new Set([
  '.jpg',
  '.jpeg',
  '.png',
  '.pdf',
  '.json',
  '.txt',
]);

export const ALLOWED_MIME_TYPES = new Set([
  'application/json',
  'application/pdf',
  'image/jpeg',
  'image/png',
  'text/plain',
]);

export const IMAGE_MIME_TYPES = new Set(['image/jpeg', 'image/png']);
export const PDF_MIME_TYPES = new Set(['application/pdf']);
export const JSON_MIME_TYPES = new Set(['application/json']);
export const TEXT_MIME_TYPES = new Set(['text/plain']);

export const MAX_BILLING_DOCUMENT_BYTES = 10 * 1024 * 1024;
export const MAX_CLOUD_UPLOAD_BYTES = 25 * 1024 * 1024;
export const MAX_FILES_PER_REQUEST = 5;
