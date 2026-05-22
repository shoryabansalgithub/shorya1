import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import archiver from 'archiver';
import * as crypto from 'crypto';
import * as fs from 'fs-extra';
import * as path from 'path';
import { SafeUserDto } from '../users/dto/safe-user.dto';
import {
  BackupType,
  CloudUploadFolder,
  CUSTOMER_SUBDIRECTORIES,
  ROOT_SUBDIRECTORIES,
  StorageCustomerDirectory,
} from './storage-security.constants';
import { DeleteStorageFileDto } from './dto/storage.dto';
import {
  normalizeDatePath,
  resolveCustomerDirectory,
  safeJoin,
  sanitizeCustomerName,
  sanitizePathSegment,
  sanitizeStorageFileName,
} from './storage-path.util';

type AuditLevel = 'info' | 'error';

export interface BackupResult {
  success: true;
  path: string;
  size: number;
}

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly rootFolder: string;
  private readonly s3Client: S3Client;
  private readonly initialized: Promise<void>;

  constructor(private readonly configService: ConfigService) {
    this.rootFolder = path.resolve(
      this.configService.get<string>('STORAGE_ROOT') ||
        path.join(process.cwd(), 'data', 'storage'),
    );

    this.s3Client = new S3Client({
      region: this.configService.get<string>('S3_REGION') || 'auto',
      endpoint: this.configService.get<string>('S3_ENDPOINT'),
      credentials: {
        accessKeyId: this.configService.get<string>('S3_ACCESS_KEY') || '',
        secretAccessKey: this.configService.get<string>('S3_SECRET_KEY') || '',
      },
    });

    this.initialized = this.initializeSystem();
  }

  private async initializeSystem(): Promise<void> {
    try {
      await fs.ensureDir(this.rootFolder);
      for (const folder of ROOT_SUBDIRECTORIES) {
        await fs.ensureDir(safeJoin(this.rootFolder, folder));
      }

      await this.ensureJsonFile(
        safeJoin(this.rootFolder, 'System', 'customer_index.json'),
        [],
      );
      await this.ensureJsonFile(
        safeJoin(this.rootFolder, 'System', 'invoice_registry.json'),
        [],
      );
      await this.ensureJsonFile(
        safeJoin(this.rootFolder, 'System', 'search_index.json'),
        { invoices: [], ocr: [], customers: [], payments: [] },
      );

      this.logger.log(`Storage system initialized at ${this.rootFolder}`);
    } catch (error) {
      this.logger.error('Failed to initialize storage system', error);
      throw error;
    }
  }

  private async ensureInitialized(): Promise<void> {
    await this.initialized;
  }

  private async ensureJsonFile(
    filePath: string,
    defaultData: Record<string, unknown> | unknown[],
  ): Promise<void> {
    if (!(await fs.pathExists(filePath))) {
      await fs.writeJson(filePath, defaultData, { spaces: 2 });
    }
  }

  private getYearMonthPath(): string {
    const date = new Date();
    return path.join(
      date.getFullYear().toString(),
      date.toLocaleString('default', { month: 'long' }),
    );
  }

  private getActor(actor: SafeUserDto): string {
    return `${actor.id}:${actor.email}:${actor.role}`;
  }

  /**
   * Audit hook: this currently writes to local append-only logs and Nest logs.
   * It is intentionally centralized so it can later fan out to Prisma AuditLog,
   * SIEM, CloudWatch, or GCP Audit Logs without changing controller code.
   */
  async logAction(
    action: string,
    level: AuditLevel = 'info',
    actor?: SafeUserDto,
  ): Promise<void> {
    await this.ensureInitialized();
    const logFile = safeJoin(
      this.rootFolder,
      'Logs',
      `${level}_${new Date().toISOString().split('T')[0]}.log`,
    );
    const timestamp = new Date().toISOString();
    const actorInfo = actor ? ` actor=${this.getActor(actor)}` : '';
    const logEntry = `[${timestamp}]${actorInfo} ${action}\n`;
    await fs.appendFile(logFile, logEntry);
    this.logger[level === 'info' ? 'log' : 'error'](`${action}${actorInfo}`);
  }

  async createCustomerFolder(
    customerName: string,
    customerId: string,
    actor: SafeUserDto,
  ): Promise<string> {
    await this.ensureInitialized();
    const sanitizedName = sanitizeCustomerName(customerName);
    const safeCustomerId = sanitizePathSegment(customerId, 'customerId');
    const customerPath = safeJoin(this.rootFolder, 'Customers', sanitizedName);

    for (const folder of CUSTOMER_SUBDIRECTORIES) {
      await fs.ensureDir(safeJoin(customerPath, folder));
    }

    const metaPath = safeJoin(customerPath, 'customer.meta.json');
    if (!(await fs.pathExists(metaPath))) {
      await fs.writeJson(
        metaPath,
        {
          customerId: safeCustomerId,
          name: customerName,
          createdAt: new Date().toISOString().split('T')[0],
          totalInvoices: 0,
          totalPending: 0,
        },
        { spaces: 2 },
      );
    }

    await this.logAction(
      `Created customer storage folder customer=${sanitizedName}`,
      'info',
      actor,
    );
    return path.join('Customers', sanitizedName);
  }

  async updateCustomerIndex(
    customerData: Record<string, unknown>,
    actor: SafeUserDto,
  ): Promise<void> {
    await this.ensureInitialized();
    const indexPath = safeJoin(this.rootFolder, 'System', 'customer_index.json');
    const index = (await fs.readJson(indexPath).catch(() => [])) as Array<
      Record<string, unknown>
    >;

    const customerId = customerData.customerId;
    const customerName =
      typeof customerData.name === 'string' ? customerData.name : 'Unknown';
    const sanitizedName = sanitizeCustomerName(customerName);

    const existingIndex = index.findIndex(
      (customer) => customer.customerId === customerId,
    );

    const safeCustomerData = {
      ...customerData,
      folderPath: path.join('Customers', sanitizedName),
      updatedAt: new Date().toISOString(),
    };

    if (existingIndex >= 0) {
      index[existingIndex] = { ...index[existingIndex], ...safeCustomerData };
    } else {
      index.push({
        ...safeCustomerData,
        createdAt: new Date().toISOString(),
      });
    }

    await fs.writeJson(indexPath, index, { spaces: 2 });
    await this.logAction(
      `Updated customer index customer=${sanitizedName}`,
      'info',
      actor,
    );
  }

  async storeInvoice(
    customerName: string,
    invoiceId: string,
    pdfFile: Express.Multer.File,
    jsonContent: Record<string, unknown>,
    thumbnailFile: Express.Multer.File | undefined,
    actor: SafeUserDto,
  ): Promise<void> {
    await this.ensureInitialized();
    const sanitizedName = sanitizeCustomerName(customerName);
    const safeInvoiceId = sanitizePathSegment(invoiceId, 'invoiceId');
    const invoiceDir = safeJoin(
      resolveCustomerDirectory(
        this.rootFolder,
        sanitizedName,
        StorageCustomerDirectory.Invoices,
      ),
      this.getYearMonthPath(),
    );

    await fs.ensureDir(invoiceDir);

    const baseName = `INV-${safeInvoiceId}`;
    await fs.writeFile(safeJoin(invoiceDir, `${baseName}.pdf`), pdfFile.buffer);
    await fs.writeJson(safeJoin(invoiceDir, `${baseName}.json`), jsonContent, {
      spaces: 2,
    });

    if (thumbnailFile) {
      await fs.writeFile(
        safeJoin(invoiceDir, `${baseName}-preview.jpg`),
        thumbnailFile.buffer,
      );
    }

    const registryPath = safeJoin(
      this.rootFolder,
      'System',
      'invoice_registry.json',
    );
    const registry = (await fs.readJson(registryPath).catch(() => [])) as Array<
      Record<string, unknown>
    >;

    registry.push({
      invoiceId: safeInvoiceId,
      customerName: sanitizedName,
      status:
        typeof jsonContent.status === 'string' ? jsonContent.status : 'Generated',
      timestamp: new Date().toISOString(),
    });
    await fs.writeJson(registryPath, registry, { spaces: 2 });

    await this.logAction(
      `Stored invoice invoice=${safeInvoiceId} customer=${sanitizedName}`,
      'info',
      actor,
    );
  }

  async storeCapturedBill(
    customerName: string,
    billId: string,
    imageFile: Express.Multer.File,
    pdfFile: Express.Multer.File | undefined,
    ocrText: string | undefined,
    thumbnailFile: Express.Multer.File | undefined,
    actor: SafeUserDto,
  ): Promise<void> {
    await this.ensureInitialized();
    const sanitizedName =
      customerName === 'Walk-in' ? 'Walk-in' : sanitizeCustomerName(customerName);
    const safeBillId = sanitizePathSegment(billId, 'billId');
    const datePath = this.getYearMonthPath();
    const baseName = `BILL-${safeBillId}`;

    const photoDir = safeJoin(
      resolveCustomerDirectory(
        this.rootFolder,
        sanitizedName,
        StorageCustomerDirectory.OriginalPhotos,
      ),
      datePath,
    );
    const billsDir = safeJoin(
      resolveCustomerDirectory(
        this.rootFolder,
        sanitizedName,
        StorageCustomerDirectory.Bills,
      ),
      datePath,
    );

    await fs.ensureDir(photoDir);
    await fs.ensureDir(billsDir);
    await fs.writeFile(safeJoin(photoDir, `${baseName}.jpg`), imageFile.buffer);
    await fs.writeFile(safeJoin(billsDir, `${baseName}.jpg`), imageFile.buffer);

    if (thumbnailFile) {
      await fs.writeFile(
        safeJoin(billsDir, `${baseName}-thumb.jpg`),
        thumbnailFile.buffer,
      );
    }

    if (pdfFile) {
      const pdfDir = safeJoin(
        resolveCustomerDirectory(
          this.rootFolder,
          sanitizedName,
          StorageCustomerDirectory.PDFs,
        ),
        datePath,
      );
      await fs.ensureDir(pdfDir);
      await fs.writeFile(safeJoin(pdfDir, `${baseName}.pdf`), pdfFile.buffer);
      await fs.writeFile(safeJoin(billsDir, `${baseName}.pdf`), pdfFile.buffer);
    }

    if (ocrText) {
      const ocrDir = safeJoin(
        resolveCustomerDirectory(
          this.rootFolder,
          sanitizedName,
          StorageCustomerDirectory.OCR,
        ),
        datePath,
      );
      await fs.ensureDir(ocrDir);
      await fs.writeFile(safeJoin(ocrDir, `${baseName}.txt`), ocrText);
      await fs.writeFile(safeJoin(billsDir, `${baseName}.txt`), ocrText);
    }

    await this.logAction(
      `Stored captured bill bill=${safeBillId} customer=${sanitizedName}`,
      'info',
      actor,
    );
  }

  async storePayment(
    customerName: string,
    paymentData: Record<string, unknown>,
    actor: SafeUserDto,
  ): Promise<void> {
    await this.ensureInitialized();
    const sanitizedName = sanitizeCustomerName(customerName);
    const paymentsDir = safeJoin(
      resolveCustomerDirectory(
        this.rootFolder,
        sanitizedName,
        StorageCustomerDirectory.Payments,
      ),
      this.getYearMonthPath(),
    );

    await fs.ensureDir(paymentsDir);

    const dateStr = new Date().toISOString().split('T')[0].replace(/-/g, '_');
    const paymentId = crypto.randomBytes(8).toString('hex');
    const fileName = `PAYMENT-${dateStr}-${paymentId}.json`;

    await fs.writeJson(safeJoin(paymentsDir, fileName), paymentData, {
      spaces: 2,
    });
    await this.logAction(
      `Stored payment customer=${sanitizedName} file=${fileName}`,
      'info',
      actor,
    );
  }

  async storeStatement(
    customerName: string,
    pdfFile: Express.Multer.File,
    actor: SafeUserDto,
  ): Promise<void> {
    await this.ensureInitialized();
    const sanitizedName = sanitizeCustomerName(customerName);
    const statementsDir = safeJoin(
      resolveCustomerDirectory(
        this.rootFolder,
        sanitizedName,
        StorageCustomerDirectory.Statements,
      ),
      this.getYearMonthPath(),
    );

    await fs.ensureDir(statementsDir);

    const month = new Date()
      .toLocaleString('default', { month: 'short', year: 'numeric' })
      .toUpperCase()
      .replace(' ', '-');
    const fileName = `STATEMENT-${month}.pdf`;

    await fs.writeFile(safeJoin(statementsDir, fileName), pdfFile.buffer);
    await this.logAction(
      `Stored statement customer=${sanitizedName} file=${fileName}`,
      'info',
      actor,
    );
  }

  async softDeleteFile(
    customerName: string,
    dto: DeleteStorageFileDto,
    actor: SafeUserDto,
  ): Promise<{ success: true; newPath: string }> {
    await this.ensureInitialized();
    const sanitizedName = sanitizeCustomerName(customerName);
    const datePath = normalizeDatePath(dto.datePath);
    const fileName = sanitizeStorageFileName(dto.fileName);
    const originalDir = safeJoin(
      resolveCustomerDirectory(this.rootFolder, sanitizedName, dto.category),
      datePath,
    );
    const originalFilePath = safeJoin(originalDir, fileName);

    if (!(await fs.pathExists(originalFilePath))) {
      throw new NotFoundException('File was not found in allowed storage scope');
    }

    const stat = await fs.stat(originalFilePath);
    if (!stat.isFile()) {
      throw new BadRequestException('Only files can be deleted');
    }

    const deletedDir = safeJoin(this.rootFolder, 'Deleted', sanitizedName);
    await fs.ensureDir(deletedDir);

    const deletedFilePath = safeJoin(
      deletedDir,
      `${Date.now()}-${crypto.randomBytes(4).toString('hex')}-${fileName}`,
    );

    try {
      await fs.move(originalFilePath, deletedFilePath, { overwrite: false });
      await this.logAction(
        `Soft deleted file customer=${sanitizedName} category=${dto.category} file=${fileName}`,
        'info',
        actor,
      );
      return {
        success: true,
        newPath: path.relative(this.rootFolder, deletedFilePath),
      };
    } catch (error) {
      await this.logAction(
        `Failed to delete file customer=${sanitizedName} file=${fileName}`,
        'error',
        actor,
      );
      throw error;
    }
  }

  async createBackup(
    type: BackupType = BackupType.Daily,
    actor: SafeUserDto,
  ): Promise<BackupResult> {
    await this.ensureInitialized();
    const backupDir = safeJoin(this.rootFolder, 'Backups', type);
    await fs.ensureDir(backupDir);

    const dateStr = new Date().toISOString().split('T')[0].replace(/-/g, '_');
    const backupPath = safeJoin(backupDir, `backup_${dateStr}.zip`);

    return new Promise<BackupResult>((resolve, reject) => {
      const output = fs.createWriteStream(backupPath);
      const archive = archiver('zip', { zlib: { level: 9 } });

      output.on('close', () => {
        const size = archive.pointer();
        this.logAction(
          `Created backup type=${type} file=${path.basename(backupPath)} size=${size}`,
          'info',
          actor,
        )
          .then(() => resolve({ success: true, path: path.relative(this.rootFolder, backupPath), size }))
          .catch(reject);
      });

      output.on('error', reject);
      archive.on('error', (error: Error) => {
        this.logAction(`Backup error type=${type}: ${error.message}`, 'error', actor)
          .then(() => reject(error))
          .catch(reject);
      });

      archive.pipe(output);

      for (const dir of ['Customers', 'Database', 'System', 'Logs']) {
        const dirPath = safeJoin(this.rootFolder, dir);
        if (fs.existsSync(dirPath)) {
          archive.directory(dirPath, dir);
        }
      }

      archive.finalize().catch(reject);
    });
  }

  async uploadFileToCloud(
    file: Express.Multer.File,
    folder: CloudUploadFolder = CloudUploadFolder.General,
    actor: SafeUserDto,
  ): Promise<string> {
    await this.ensureInitialized();
    const bucketName = this.configService.get<string>('S3_BUCKET');
    if (!bucketName) {
      throw new InternalServerErrorException('Cloud storage is not configured');
    }

    const safeOriginalName = sanitizeStorageFileName(file.originalname);
    const uniqueId = crypto.randomBytes(8).toString('hex');
    const sanitizedName = sanitizePathSegment(
      path.parse(safeOriginalName).name,
      'fileName',
    );
    const ext = path.extname(safeOriginalName).toLowerCase();
    const objectKey = `${folder}/${sanitizedName}-${uniqueId}${ext}`;

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: objectKey,
      Body: file.buffer,
      ContentType: file.mimetype,
    });

    try {
      await this.s3Client.send(command);
      await this.logAction(`Uploaded file to cloud key=${objectKey}`, 'info', actor);

      const endpoint = this.configService.get<string>('S3_ENDPOINT');
      const publicUrlBase = this.configService.get<string>('S3_PUBLIC_URL');

      if (publicUrlBase) {
        return `${publicUrlBase}/${objectKey}`;
      }

      const domain = endpoint ? new URL(endpoint).hostname : 's3.amazonaws.com';
      return `https://${bucketName}.${domain}/${objectKey}`;
    } catch (error) {
      await this.logAction(`Cloud upload failed key=${objectKey}`, 'error', actor);
      throw error;
    }
  }
}
