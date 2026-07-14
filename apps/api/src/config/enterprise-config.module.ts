import { Global, Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { validateSync } from 'class-validator';

import { AppConfig, Environment } from './domains/app.config';
import { DatabaseConfig } from './domains/database.config';
import { JwtConfig } from './domains/jwt.config';
import { RedisConfig } from './domains/redis.config';
import { StorageConfig } from './domains/storage.config';
import { AiConfig } from './domains/ai.config';
import { ApiConfig } from './domains/api.config';
import { PrismaConfig } from './domains/prisma.config';
import { QueueConfig } from './domains/queue.config';
import { BullConfig } from './domains/bull.config';
import { CacheConfig } from './domains/cache.config';
import { MediaConfig } from './domains/media.config';
import { SearchConfig } from './domains/search.config';
import { AnalyticsConfig } from './domains/analytics.config';
import { EmailConfig } from './domains/email.config';
import { SmsConfig } from './domains/sms.config';
import { WhatsappConfig } from './domains/whatsapp.config';
import { OAuthConfig } from './domains/oauth.config';
import { PaymentsConfig } from './domains/payments.config';
import { FileUploadConfig } from './domains/file-upload.config';
import { FeatureFlagsConfig } from './domains/feature-flags.config';
import { MonitoringConfig } from './domains/monitoring.config';
import { LoggingConfig } from './domains/logging.config';
import { PerformanceConfig } from './domains/performance.config';
import { SecurityConfig } from './domains/security.config';
import { CorsConfig } from './domains/cors.config';
import { SwaggerConfig } from './domains/swagger.config';
import { HealthConfig } from './domains/health.config';
import { CronConfig } from './domains/cron.config';

function validateConfig<T extends object>(configClass: T): T {
  const errors = validateSync(configClass);
  if (errors.length > 0) {
    const errorMessages = errors.map(e => Object.values(e.constraints || {}).join(', ')).join('\n');
    throw new Error(`Configuration validation failed for ${configClass.constructor.name}:\n${errorMessages}`);
  }
  return configClass;
}

@Global()
@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', `.env.${process.env.NODE_ENV || 'development'}`, '.env'],
    }),
  ],
  providers: [
    {
      provide: AppConfig,
      useFactory: () => {
        const config = new AppConfig();
        Object.assign(config, {
          nodeEnv: (process.env.NODE_ENV as Environment) || Environment.Development,
          port: parseInt(process.env.PORT || '3002', 10),
          frontendUrl: process.env.FRONTEND_URL,
        });
        return validateConfig(config);
      },
    },
    {
      provide: DatabaseConfig,
      useFactory: () => {
        const config = new DatabaseConfig();
        Object.assign(config, {
          databaseUrl: process.env.DATABASE_URL,
        });
        return validateConfig(config);
      },
    },
    {
      provide: JwtConfig,
      useFactory: () => {
        const config = new JwtConfig();
        Object.assign(config, {
          jwtSecret: process.env.JWT_SECRET,
          jwtExpiresIn: process.env.JWT_EXPIRES_IN,
          jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,
          jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
        });
        return validateConfig(config);
      },
    },
    {
      provide: RedisConfig,
      useFactory: () => {
        const config = new RedisConfig();
        Object.assign(config, {
          redisUrl: process.env.REDIS_URL,
        });
        return validateConfig(config);
      },
    },
    {
      provide: StorageConfig,
      useFactory: () => {
        const config = new StorageConfig();
        Object.assign(config, {
          storageRoot: process.env.STORAGE_ROOT,
          s3Region: process.env.S3_REGION,
          s3Endpoint: process.env.S3_ENDPOINT,
          s3AccessKey: process.env.S3_ACCESS_KEY,
          s3SecretKey: process.env.S3_SECRET_KEY,
          s3Bucket: process.env.S3_BUCKET,
          s3PublicUrl: process.env.S3_PUBLIC_URL,
        });
        return validateConfig(config);
      },
    },
    {
      provide: AiConfig,
      useFactory: () => {
        const config = new AiConfig();
        Object.assign(config, {
          geminiApiKey: process.env.GEMINI_API_KEY,
        });
        return validateConfig(config);
      },
    },
    {
      provide: ApiConfig,
      useFactory: () => {
        const config = new ApiConfig();
        return validateConfig(config);
      },
    },
    {
      provide: PrismaConfig,
      useFactory: () => {
        const config = new PrismaConfig();
        return validateConfig(config);
      },
    },
    {
      provide: QueueConfig,
      useFactory: () => {
        const config = new QueueConfig();
        return validateConfig(config);
      },
    },
    {
      provide: BullConfig,
      useFactory: () => {
        const config = new BullConfig();
        return validateConfig(config);
      },
    },
    {
      provide: CacheConfig,
      useFactory: () => {
        const config = new CacheConfig();
        return validateConfig(config);
      },
    },
    {
      provide: MediaConfig,
      useFactory: () => {
        const config = new MediaConfig();
        return validateConfig(config);
      },
    },
    {
      provide: SearchConfig,
      useFactory: () => {
        const config = new SearchConfig();
        return validateConfig(config);
      },
    },
    {
      provide: AnalyticsConfig,
      useFactory: () => {
        const config = new AnalyticsConfig();
        return validateConfig(config);
      },
    },
    {
      provide: EmailConfig,
      useFactory: () => {
        const config = new EmailConfig();
        return validateConfig(config);
      },
    },
    {
      provide: SmsConfig,
      useFactory: () => {
        const config = new SmsConfig();
        return validateConfig(config);
      },
    },
    {
      provide: WhatsappConfig,
      useFactory: () => {
        const config = new WhatsappConfig();
        return validateConfig(config);
      },
    },
    {
      provide: OAuthConfig,
      useFactory: () => {
        const config = new OAuthConfig();
        return validateConfig(config);
      },
    },
    {
      provide: PaymentsConfig,
      useFactory: () => {
        const config = new PaymentsConfig();
        return validateConfig(config);
      },
    },
    {
      provide: FileUploadConfig,
      useFactory: () => {
        const config = new FileUploadConfig();
        return validateConfig(config);
      },
    },
    {
      provide: FeatureFlagsConfig,
      useFactory: () => {
        const config = new FeatureFlagsConfig();
        return validateConfig(config);
      },
    },
    {
      provide: MonitoringConfig,
      useFactory: () => {
        const config = new MonitoringConfig();
        return validateConfig(config);
      },
    },
    {
      provide: LoggingConfig,
      useFactory: () => {
        const config = new LoggingConfig();
        return validateConfig(config);
      },
    },
    {
      provide: PerformanceConfig,
      useFactory: () => {
        const config = new PerformanceConfig();
        return validateConfig(config);
      },
    },
    {
      provide: SecurityConfig,
      useFactory: () => {
        const config = new SecurityConfig();
        return validateConfig(config);
      },
    },
    {
      provide: CorsConfig,
      useFactory: () => {
        const config = new CorsConfig();
        return validateConfig(config);
      },
    },
    {
      provide: SwaggerConfig,
      useFactory: () => {
        const config = new SwaggerConfig();
        return validateConfig(config);
      },
    },
    {
      provide: HealthConfig,
      useFactory: () => {
        const config = new HealthConfig();
        return validateConfig(config);
      },
    },
    {
      provide: CronConfig,
      useFactory: () => {
        const config = new CronConfig();
        return validateConfig(config);
      },
    },
  ],
  exports: [
    AppConfig,
    DatabaseConfig,
    JwtConfig,
    RedisConfig,
    StorageConfig,
    AiConfig,
    ApiConfig,
    PrismaConfig,
    QueueConfig,
    BullConfig,
    CacheConfig,
    MediaConfig,
    SearchConfig,
    AnalyticsConfig,
    EmailConfig,
    SmsConfig,
    WhatsappConfig,
    OAuthConfig,
    PaymentsConfig,
    FileUploadConfig,
    FeatureFlagsConfig,
    MonitoringConfig,
    LoggingConfig,
    PerformanceConfig,
    SecurityConfig,
    CorsConfig,
    SwaggerConfig,
    HealthConfig,
    CronConfig,
  ],
})
export class EnterpriseConfigModule {}
