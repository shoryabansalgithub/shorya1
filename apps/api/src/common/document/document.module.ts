import { Module } from '@nestjs/common';
import { DocumentGenerationService } from './document-generation.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [DocumentGenerationService],
  exports: [DocumentGenerationService],
})
export class DocumentModule {}
