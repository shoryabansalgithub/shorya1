import {
  Body,
  Controller,
  Delete,
  Param,
  Post,
  Request,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { Role } from '@prisma/client';
import type { Request as ExpressRequest } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { SafeUserDto } from '../users/dto/safe-user.dto';
import {
  MAX_CLOUD_UPLOAD_BYTES,
  MAX_BILLING_DOCUMENT_BYTES,
  MAX_FILES_PER_REQUEST,
} from './storage-security.constants';
import {
  assertImageFile,
  assertOptionalImageFile,
  assertOptionalPdfFile,
  assertPdfFile,
  cloudUploadPolicy,
  secureFileFilter,
  validateUploadedFile,
} from './storage-upload.util';
import {
  BackupStorageDto,
  CloudUploadDto,
  CreateCustomerFolderDto,
  DeleteStorageFileDto,
  StoreCapturedBillBodyDto,
  StoreInvoiceBodyDto,
  StorePaymentDto,
} from './dto/storage.dto';
import { StorageService } from './storage.service';

interface AuthenticatedRequest extends ExpressRequest {
  user: SafeUserDto;
}

const billingUploadInterceptor = AnyFilesInterceptor({
  fileFilter: secureFileFilter,
  limits: {
    fileSize: MAX_BILLING_DOCUMENT_BYTES,
    files: MAX_FILES_PER_REQUEST,
  },
});

const cloudUploadInterceptor = AnyFilesInterceptor({
  fileFilter: secureFileFilter,
  limits: {
    fileSize: MAX_CLOUD_UPLOAD_BYTES,
    files: 1,
  },
});

function findFile(
  files: Express.Multer.File[] | undefined,
  fieldName: string,
): Express.Multer.File | undefined {
  return files?.find((file) => file.fieldname === fieldName);
}

function parseJsonObject(rawJson: string | undefined): Record<string, unknown> {
  if (!rawJson) return {};

  const parsed: unknown = JSON.parse(rawJson);
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    return {};
  }

  return parsed as Record<string, unknown>;
}

/**
 * Every storage endpoint is authenticated and role-checked. Authentication alone
 * is not enough for storage APIs: a valid CASHIER should be able to upload
 * billing evidence, but must never be able to delete files or trigger backups.
 *
 * Rate limiting recommendation: wire ThrottlerModule globally and apply a
 * stricter @Throttle policy here, especially for upload, backup, and delete.
 */
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('storage')
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  @Post('customers')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.MANAGER)
  async createCustomerFolder(
    @Body() body: CreateCustomerFolderDto,
    @Request() req: AuthenticatedRequest,
  ) {
    const folderPath = await this.storageService.createCustomerFolder(
      body.name,
      body.customerId || `CUST-${Date.now()}`,
      req.user,
    );

    if (body.customerData) {
      await this.storageService.updateCustomerIndex(body.customerData, req.user);
    }

    return { success: true, path: folderPath };
  }

  @Post('invoices/:customerName/:invoiceId')
  @Roles(Role.CASHIER, Role.MANAGER, Role.ADMIN, Role.SUPER_ADMIN)
  @UseInterceptors(billingUploadInterceptor)
  async storeInvoice(
    @Param('customerName') customerName: string,
    @Param('invoiceId') invoiceId: string,
    @UploadedFiles() files: Express.Multer.File[] | undefined,
    @Body() body: StoreInvoiceBodyDto,
    @Request() req: AuthenticatedRequest,
  ) {
    const pdfFile = assertPdfFile(findFile(files, 'pdf'));
    const thumbnailFile = assertOptionalImageFile(findFile(files, 'thumbnail'));
    const jsonContent = parseJsonObject(body.jsonContent);

    await this.storageService.storeInvoice(
      customerName,
      invoiceId,
      pdfFile,
      jsonContent,
      thumbnailFile,
      req.user,
    );

    return { success: true };
  }

  @Post('bills/:customerName/:billId')
  @Roles(Role.CASHIER, Role.MANAGER, Role.ADMIN, Role.SUPER_ADMIN)
  @UseInterceptors(billingUploadInterceptor)
  async storeCapturedBill(
    @Param('customerName') customerName: string,
    @Param('billId') billId: string,
    @UploadedFiles() files: Express.Multer.File[] | undefined,
    @Body() body: StoreCapturedBillBodyDto,
    @Request() req: AuthenticatedRequest,
  ) {
    const imageFile = assertImageFile(findFile(files, 'image'));
    const pdfFile = assertOptionalPdfFile(findFile(files, 'pdf'));
    const thumbnailFile = assertOptionalImageFile(findFile(files, 'thumbnail'));

    await this.storageService.storeCapturedBill(
      customerName,
      billId,
      imageFile,
      pdfFile,
      body.ocrText,
      thumbnailFile,
      req.user,
    );

    return { success: true };
  }

  @Post('payments/:customerName')
  @Roles(Role.CASHIER, Role.MANAGER, Role.ADMIN, Role.SUPER_ADMIN)
  async storePayment(
    @Param('customerName') customerName: string,
    @Body() body: StorePaymentDto,
    @Request() req: AuthenticatedRequest,
  ) {
    await this.storageService.storePayment(customerName, body.paymentData, req.user);
    return { success: true };
  }

  @Post('statements/:customerName')
  @Roles(Role.CASHIER, Role.MANAGER, Role.ADMIN, Role.SUPER_ADMIN)
  @UseInterceptors(billingUploadInterceptor)
  async storeStatement(
    @Param('customerName') customerName: string,
    @UploadedFiles() files: Express.Multer.File[] | undefined,
    @Request() req: AuthenticatedRequest,
  ) {
    const pdfFile = assertPdfFile(findFile(files, 'pdf'));
    await this.storageService.storeStatement(customerName, pdfFile, req.user);
    return { success: true };
  }

  @Delete('files/:customerName')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  async deleteFile(
    @Param('customerName') customerName: string,
    @Body() body: DeleteStorageFileDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.storageService.softDeleteFile(customerName, body, req.user);
  }

  @Post('backup')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  async triggerBackup(
    @Body() body: BackupStorageDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.storageService.createBackup(body.type, req.user);
  }

  @Post('cloud/upload')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @UseInterceptors(cloudUploadInterceptor)
  async uploadToCloud(
    @UploadedFiles() files: Express.Multer.File[] | undefined,
    @Body() body: CloudUploadDto,
    @Request() req: AuthenticatedRequest,
  ) {
    const file = validateUploadedFile(files?.[0], cloudUploadPolicy);

    const url = await this.storageService.uploadFileToCloud(
      file,
      body.folder,
      req.user,
    );

    return { success: true, url };
  }
}
