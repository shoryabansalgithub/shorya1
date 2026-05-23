import { Controller, Post, UseInterceptors, UploadedFile, Body, UseGuards, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { OcrService } from './ocr.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('ocr')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
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
      throw new BadRequestException('No file provided');
    }

    // Pass the file buffer to the OCR service
    const result = await this.ocrService.processDocument(file.buffer, documentType);
    return result;
  }
}
