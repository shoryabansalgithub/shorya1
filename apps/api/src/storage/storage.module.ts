import { Module } from '@nestjs/common';
import { StorageService } from './storage.service';
import { StorageController } from './storage.controller';
import { AuthModule } from '../auth/auth.module';
import { StoragePathBuilder } from './storage-path.builder';

@Module({
  imports: [AuthModule],
  providers: [StorageService, StoragePathBuilder],
  controllers: [StorageController],
  exports: [StorageService, StoragePathBuilder],
})
export class StorageModule {}
