import { Module } from '@nestjs/common';
import { StorageService } from './storage.service';
import { StorageController } from './storage.controller';
import { AuthModule } from '../auth/auth.module';
import { StoragePathBuilder } from './storage-path.builder';
import { S3Client } from '@aws-sdk/client-s3';
import { StorageConfig } from '../config/domains/storage.config';
import { S3_CLIENT } from './storage.tokens';

// Re-exported for backwards compatibility with existing `from './storage.module'`
// imports. The token itself lives in ./storage.tokens to avoid a circular import.
export { S3_CLIENT };

@Module({
  imports: [AuthModule],
  providers: [
    StorageService,
    StoragePathBuilder,
    {
      provide: S3_CLIENT,
      useFactory: (storageConfig: StorageConfig) => {
        return new S3Client({
          region: storageConfig.s3Region || 'auto',
          endpoint: storageConfig.s3Endpoint,
          credentials: {
            accessKeyId: storageConfig.s3AccessKey || '',
            secretAccessKey: storageConfig.s3SecretKey || '',
          },
        });
      },
      inject: [StorageConfig],
    },
  ],
  controllers: [StorageController],
  exports: [StorageService, StoragePathBuilder, S3_CLIENT],
})
export class StorageModule {}
