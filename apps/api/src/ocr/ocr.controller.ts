import { Controller, Post, UseInterceptors, UploadedFile, Body } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { OcrService } from './ocr.service';

@Controller('ocr')
export class OcrController {
  constructor(private readonly ocrService: OcrService) {}

  @Post('scan-bill')
  @UseInterceptors(FileInterceptor('file'))
  async scanHandwrittenBill(
    @UploadedFile() file: Express.Multer.File,
    @Body('documentType') documentType: string,
  ) {
    if (!file) {
      throw new Error('No file provided');
    }

    // Pass the file buffer to the OCR service
    const result = await this.ocrService.processDocument(file.buffer, documentType);
    return result;
  }
}
