import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as crypto from 'crypto';
import archiver = require('archiver');

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly rootFolder: string = 'C:/Users/kukpo/OneDrive/Desktop/DB of DukanAi';

  constructor() {
    this.initializeSystem();
  }

  private async initializeSystem() {
    try {
      await fs.ensureDir(this.rootFolder);
      const mainFolders = [
        'Customers', 'Database', 'System', 'Backups/Daily', 'Backups/Weekly', 'Backups/Monthly', 
        'Cache/Thumbnails', 'Temp', 'Archive', 'Logs', 'Deleted'
      ];
      
      for (const folder of mainFolders) {
        await fs.ensureDir(path.join(this.rootFolder, folder));
      }

      // Initialize System Metadata Files
      await this.ensureJsonFile(path.join(this.rootFolder, 'System', 'customer_index.json'), []);
      await this.ensureJsonFile(path.join(this.rootFolder, 'System', 'invoice_registry.json'), []);
      await this.ensureJsonFile(path.join(this.rootFolder, 'System', 'search_index.json'), { invoices: [], ocr: [], customers: [], payments: [] });

      this.logger.log(`Storage System initialized at ${this.rootFolder}`);
    } catch (error) {
      this.logger.error('Failed to initialize storage system', error);
    }
  }

  private async ensureJsonFile(filePath: string, defaultData: any) {
    if (!(await fs.pathExists(filePath))) {
      await fs.writeJson(filePath, defaultData, { spaces: 2 });
    }
  }

  private sanitizeName(name: string): string {
    return name.replace(/[^a-z0-9]/gi, '_').replace(/_{2,}/g, '_').replace(/^_|_$/g, '');
  }

  private getYearMonthPath(): string {
    const date = new Date();
    const year = date.getFullYear().toString();
    const month = date.toLocaleString('default', { month: 'long' });
    return path.join(year, month);
  }

  private isValidFileType(fileName: string): boolean {
    const ext = path.extname(fileName).toLowerCase();
    return ['.jpg', '.jpeg', '.png', '.pdf', '.json', '.txt'].includes(ext);
  }

  async logAction(action: string, level: 'info' | 'error' = 'info') {
    const logFile = path.join(this.rootFolder, 'Logs', `${level}_${new Date().toISOString().split('T')[0]}.log`);
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${action}\n`;
    await fs.appendFile(logFile, logEntry);
    this.logger[level === 'info' ? 'log' : 'error'](action);
  }

  async createCustomerFolder(customerName: string, customerId: string) {
    const sanitizedName = this.sanitizeName(customerName);
    const customerPath = path.join(this.rootFolder, 'Customers', sanitizedName);

    const subfolders = [
      'Profile', 'Invoices', 'Bills', 'Original_Photos', 'PDFs', 
      'OCR', 'Payments', 'Statements', 'Notes', 'Backups', 'Deleted'
    ];

    for (const folder of subfolders) {
      await fs.ensureDir(path.join(customerPath, folder));
    }

    // Create customer.meta.json
    const metaPath = path.join(customerPath, 'customer.meta.json');
    if (!(await fs.pathExists(metaPath))) {
      await fs.writeJson(metaPath, {
        customerId,
        name: customerName,
        createdAt: new Date().toISOString().split('T')[0],
        totalInvoices: 0,
        totalPending: 0
      }, { spaces: 2 });
    }

    await this.logAction(`Created dynamic folder structure for customer: ${sanitizedName}`);
    return customerPath;
  }

  async updateCustomerIndex(customerData: any) {
    const indexPath = path.join(this.rootFolder, 'System', 'customer_index.json');
    const index = await fs.readJson(indexPath).catch(() => []);
    
    const existingIndex = index.findIndex((c: any) => c.customerId === customerData.customerId);
    if (existingIndex >= 0) {
      index[existingIndex] = { ...index[existingIndex], ...customerData };
    } else {
      index.push({ 
        ...customerData, 
        folderPath: path.join('Customers', this.sanitizeName(customerData.name)), 
        createdAt: new Date().toISOString() 
      });
    }

    await fs.writeJson(indexPath, index, { spaces: 2 });
    await this.logAction(`Updated system customer index for ${customerData.name}`);
  }

  async storeInvoice(customerName: string, invoiceId: string, pdfBuffer: Buffer, jsonContent: any, thumbnailBuffer?: Buffer) {
    const sanitizedName = this.sanitizeName(customerName);
    const customerPath = path.join(this.rootFolder, 'Customers', sanitizedName);
    const datePath = this.getYearMonthPath();
    const invoiceDir = path.join(customerPath, 'Invoices', datePath);

    await fs.ensureDir(invoiceDir);

    const baseName = `INV-${invoiceId}`;
    await fs.writeFile(path.join(invoiceDir, `${baseName}.pdf`), pdfBuffer);
    await fs.writeJson(path.join(invoiceDir, `${baseName}.json`), jsonContent, { spaces: 2 });
    
    if (thumbnailBuffer) {
      await fs.writeFile(path.join(invoiceDir, `${baseName}-preview.jpg`), thumbnailBuffer);
    }

    await this.logAction(`Stored invoice ${invoiceId} for customer ${sanitizedName}`);
    
    // Update master registry
    const registryPath = path.join(this.rootFolder, 'System', 'invoice_registry.json');
    const registry = await fs.readJson(registryPath).catch(() => []);
    
    registry.push({
      invoiceId,
      customerName: sanitizedName,
      status: jsonContent.status || 'Generated',
      timestamp: new Date().toISOString()
    });
    await fs.writeJson(registryPath, registry, { spaces: 2 });
  }

  async storeCapturedBill(customerName: string, billId: string, imageBuffer: Buffer, pdfBuffer?: Buffer, ocrText?: string, thumbnailBuffer?: Buffer) {
    const sanitizedName = customerName === 'Walk-in' ? 'Walk-in' : this.sanitizeName(customerName);
    const customerPath = path.join(this.rootFolder, 'Customers', sanitizedName);
    const datePath = this.getYearMonthPath();
    const baseName = `BILL-${billId}`;
    
    // Original Photo (permanently stored even if OCR fails)
    const photoDir = path.join(customerPath, 'Original_Photos', datePath);
    await fs.ensureDir(photoDir);
    await fs.writeFile(path.join(photoDir, `${baseName}.jpg`), imageBuffer);

    // Bill general folder
    const billsDir = path.join(customerPath, 'Bills', datePath);
    await fs.ensureDir(billsDir);
    await fs.writeFile(path.join(billsDir, `${baseName}.jpg`), imageBuffer);
    
    if (thumbnailBuffer) {
      await fs.writeFile(path.join(billsDir, `${baseName}-thumb.jpg`), thumbnailBuffer);
    }

    if (pdfBuffer) {
      const pdfDir = path.join(customerPath, 'PDFs', datePath);
      await fs.ensureDir(pdfDir);
      await fs.writeFile(path.join(pdfDir, `${baseName}.pdf`), pdfBuffer);
      await fs.writeFile(path.join(billsDir, `${baseName}.pdf`), pdfBuffer);
    }

    if (ocrText) {
      const ocrDir = path.join(customerPath, 'OCR', datePath);
      await fs.ensureDir(ocrDir);
      await fs.writeFile(path.join(ocrDir, `${baseName}.txt`), ocrText);
      await fs.writeFile(path.join(billsDir, `${baseName}.txt`), ocrText);
    }

    await this.logAction(`Stored captured bill ${billId} for customer ${sanitizedName}`);
  }

  async storePayment(customerName: string, paymentData: any) {
    const sanitizedName = this.sanitizeName(customerName);
    const datePath = this.getYearMonthPath();
    const paymentsDir = path.join(this.rootFolder, 'Customers', sanitizedName, 'Payments', datePath);
    
    await fs.ensureDir(paymentsDir);

    const dateStr = new Date().toISOString().split('T')[0].replace(/-/g, '_');
    const paymentId = crypto.randomBytes(4).toString('hex');
    const fileName = `PAYMENT-${dateStr}-${paymentId}.json`;
    
    await fs.writeJson(path.join(paymentsDir, fileName), paymentData, { spaces: 2 });
    await this.logAction(`Stored payment record for customer ${sanitizedName}`);
  }

  async storeStatement(customerName: string, pdfBuffer: Buffer) {
    const sanitizedName = this.sanitizeName(customerName);
    const datePath = this.getYearMonthPath();
    const statementsDir = path.join(this.rootFolder, 'Customers', sanitizedName, 'Statements', datePath);
    
    await fs.ensureDir(statementsDir);

    const month = new Date().toLocaleString('default', { month: 'short', year: 'numeric' }).toUpperCase().replace(' ', '-');
    const fileName = `STATEMENT-${month}.pdf`;
    
    await fs.writeFile(path.join(statementsDir, fileName), pdfBuffer);
    await this.logAction(`Stored statement for customer ${sanitizedName}`);
  }

  async softDeleteFile(customerName: string, originalCategory: string, datePath: string, fileName: string) {
    const sanitizedName = this.sanitizeName(customerName);
    const originalFilePath = path.join(this.rootFolder, 'Customers', sanitizedName, originalCategory, datePath, fileName);
    
    // Global Deleted folder vs Customer Deleted folder
    const deletedDir = path.join(this.rootFolder, 'Deleted', sanitizedName);
    await fs.ensureDir(deletedDir);
    
    const deletedFilePath = path.join(deletedDir, fileName);

    try {
      await fs.move(originalFilePath, deletedFilePath, { overwrite: true });
      await this.logAction(`Soft deleted file ${fileName} for customer ${sanitizedName}`);
      return { success: true, newPath: deletedFilePath };
    } catch (error) {
      await this.logAction(`Failed to delete file ${fileName}: ${error.message}`, 'error');
      throw error;
    }
  }

  async createBackup(type: 'Daily' | 'Weekly' | 'Monthly' = 'Daily') {
    return new Promise((resolve, reject) => {
      const dateStr = new Date().toISOString().split('T')[0].replace(/-/g, '_');
      const backupDir = path.join(this.rootFolder, 'Backups', type);
      const backupPath = path.join(backupDir, `backup_${dateStr}.zip`);

      const output = fs.createWriteStream(backupPath);
      const archive = archiver('zip', { zlib: { level: 9 } });

      output.on('close', async () => {
        const size = archive.pointer();
        await this.logAction(`${type} backup created: backup_${dateStr}.zip (${size} bytes)`);
        resolve({ success: true, path: backupPath, size });
      });

      archive.on('error', (err: any) => {
        this.logAction(`Backup error: ${err.message}`, 'error');
        reject(err);
      });

      archive.pipe(output);

      // Add major directories to backup
      const dirsToBackup = ['Customers', 'Database', 'System', 'Logs'];
      for (const dir of dirsToBackup) {
        const dirPath = path.join(this.rootFolder, dir);
        if (fs.existsSync(dirPath)) {
          archive.directory(dirPath, dir);
        }
      }

      archive.finalize();
    });
  }
}
