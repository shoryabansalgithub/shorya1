import { Global, Module } from '@nestjs/common';
import { AuthBypassService } from './auth-bypass.service';

/**
 * Global so JwtAuthGuard can inject AuthBypassService from every module
 * context it is instantiated in (APP_GUARD in AppModule as well as direct
 * @UseGuards usage in feature modules).
 */
@Global()
@Module({
  providers: [AuthBypassService],
  exports: [AuthBypassService],
})
export class AuthBypassModule {}
