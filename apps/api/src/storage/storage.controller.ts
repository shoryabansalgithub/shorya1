import { Controller, Post, Body, Param, UploadedFiles, UseInterceptors, Delete } from '@nestjs/common';
import { StorageService } from './storage.service';
import { AnyFilesInterceptor } from '@nestjs/platform-express';

@Controller('storage')
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  @Post('customers')
  async createCustomerFolder(@Body('name') name: string, @Body('customerId') customerId: string, @Body('customerData') customerData: any) {
    const path = await this.storageService.createCustomerFolder(name, customerId || `CUST-${Date.now()}`);
    if (customerData) {
      await this.storageService.updateCustomerIndex(customerData);
    }
    return { success: true, path };
  }

  @Post('invoices/:customerName/:invoiceId')
  @UseInterceptors(AnyFilesInterceptor())
  async storeInvoice(
    @Param('customerName') customerName: string,
    @Param('invoiceId') invoiceId: string,
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Body('jsonContent') jsonContentStr: string,
  ) {
    const pdfFile = files.find(f => f.fieldname === 'pdf');
    const thumbnailFile = files.find(f => f.fieldname === 'thumbnail');
    const jsonContent = jsonContentStr ? JSON.parse(jsonContentStr) : {};

    if (!pdfFile) {
      return { success: false, error: 'PDF file is required' };
    }

    await this.storageService.storeInvoice(
      customerName, 
      invoiceId, 
      pdfFile.buffer, 
      jsonContent, 
      thumbnailFile?.buffer
    );

    return { success: true };
  }

  @Post('bills/:customerName/:billId')
  @UseInterceptors(AnyFilesInterceptor())
  async storeCapturedBill(
    @Param('customerName') customerName: string,
    @Param('billId') billId: string,
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Body('ocrText') ocrText: string,
  ) {
    const imageFile = files.find(f => f.fieldname === 'image');
    const pdfFile = files.find(f => f.fieldname === 'pdf');
    const thumbnailFile = files.find(f => f.fieldname === 'thumbnail');

    if (!imageFile) {
      return { success: false, error: 'Original image is required' };
    }

    await this.storageService.storeCapturedBill(
      customerName, 
      billId, 
      imageFile.buffer, 
      pdfFile?.buffer, 
      ocrText,
      thumbnailFile?.buffer
    );

    return { success: true };
  }

  @Post('payments/:customerName')
  async storePayment(
    @Param('customerName') customerName: string,
    @Body() paymentData: any,
  ) {
    await this.storageService.storePayment(customerName, paymentData);
    return { success: true };
  }

  @Post('statements/:customerName')
  @UseInterceptors(AnyFilesInterceptor())
  async storeStatement(
    @Param('customerName') customerName: string,
    @UploadedFiles() files: Array<Express.Multer.File>,
  ) {
    const pdfFile = files.find(f => f.fieldname === 'pdf');
    if (!pdfFile) return { success: false, error: 'Statement PDF is required' };

    await this.storageService.storeStatement(customerName, pdfFile.buffer);
    return { success: true };
  }

  @Delete('files/:customerName')
  async deleteFile(
    @Param('customerName') customerName: string,
    @Body('category') category: string,
    @Body('datePath') datePath: string,
    @Body('fileName') fileName: string,
  ) {
    const result = await this.storageService.softDeleteFile(customerName, category, datePath, fileName);
    return result;
  }

  @Post('backup')
  async triggerBackup(@Body('type') type: 'Daily' | 'Weekly' | 'Monthly') {
    const result = await this.storageService.createBackup(type || 'Daily');
    return result;
  }
}

