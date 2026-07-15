import { Injectable } from '@nestjs/common';
import { AiConfig } from '../domains/ai.config';
import { AnalyticsConfig } from '../domains/analytics.config';
import { ApiConfig } from '../domains/api.config';
import { AppConfig } from '../domains/app.config';
import { BullConfig } from '../domains/bull.config';
import { CacheConfig } from '../domains/cache.config';
import { CorsConfig } from '../domains/cors.config';
import { CronConfig } from '../domains/cron.config';
import { DatabaseConfig } from '../domains/database.config';
import { EmailConfig } from '../domains/email.config';
import { FeatureFlagsConfig } from '../domains/feature-flags.config';
import { FileUploadConfig } from '../domains/file-upload.config';
import { HealthConfig } from '../domains/health.config';
import { JwtConfig } from '../domains/jwt.config';
import { LoggingConfig } from '../domains/logging.config';
import { MediaConfig } from '../domains/media.config';
import { MonitoringConfig } from '../domains/monitoring.config';
import { OAuthConfig } from '../domains/oauth.config';
import { PaymentsConfig } from '../domains/payments.config';
import { PerformanceConfig } from '../domains/performance.config';
import { PrismaConfig } from '../domains/prisma.config';
import { QueueConfig } from '../domains/queue.config';
import { RedisConfig } from '../domains/redis.config';
import { SearchConfig } from '../domains/search.config';
import { SecurityConfig } from '../domains/security.config';
import { SmsConfig } from '../domains/sms.config';
import { StorageConfig } from '../domains/storage.config';
import { SwaggerConfig } from '../domains/swagger.config';
import { WhatsappConfig } from '../domains/whatsapp.config';

@Injectable()
export class ValidationContext {
  constructor(
    public readonly aiConfig: AiConfig,
    public readonly analyticsConfig: AnalyticsConfig,
    public readonly apiConfig: ApiConfig,
    public readonly appConfig: AppConfig,
    public readonly bullConfig: BullConfig,
    public readonly cacheConfig: CacheConfig,
    public readonly corsConfig: CorsConfig,
    public readonly cronConfig: CronConfig,
    public readonly databaseConfig: DatabaseConfig,
    public readonly emailConfig: EmailConfig,
    public readonly featureFlagsConfig: FeatureFlagsConfig,
    public readonly fileUploadConfig: FileUploadConfig,
    public readonly healthConfig: HealthConfig,
    public readonly jwtConfig: JwtConfig,
    public readonly loggingConfig: LoggingConfig,
    public readonly mediaConfig: MediaConfig,
    public readonly monitoringConfig: MonitoringConfig,
    public readonly oauthConfig: OAuthConfig,
    public readonly paymentsConfig: PaymentsConfig,
    public readonly performanceConfig: PerformanceConfig,
    public readonly prismaConfig: PrismaConfig,
    public readonly queueConfig: QueueConfig,
    public readonly redisConfig: RedisConfig,
    public readonly searchConfig: SearchConfig,
    public readonly securityConfig: SecurityConfig,
    public readonly smsConfig: SmsConfig,
    public readonly storageConfig: StorageConfig,
    public readonly swaggerConfig: SwaggerConfig,
    public readonly whatsappConfig: WhatsappConfig
  ) {}
}
