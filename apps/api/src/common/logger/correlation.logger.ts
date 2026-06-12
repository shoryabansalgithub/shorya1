import { ConsoleLogger, Injectable } from '@nestjs/common';
import { CorrelationContextService } from '../correlation/correlation-context.service';

@Injectable()
export class CorrelationLogger extends ConsoleLogger {
  constructor(context?: string) {
    super(context || '');
  }

  private formatMessageWithCorrelation(message: any): any {
    const correlationId = CorrelationContextService.asAsyncLocalStorage.getStore() || 'system-job';
    
    let safeMessage = message;

    if (typeof message === 'object' && message !== null) {
      safeMessage = this.redact(message);
      return { ...safeMessage, correlationId };
    }
    
    return { message: safeMessage, correlationId };
  }

  private redact(obj: any): any {
    // Prevent mutating the original object
    const copy = { ...obj };
    const sensitiveKeys = ['password', 'token', 'cookie', 'secret', 'payment'];
    
    for (const key of Object.keys(copy)) {
      if (sensitiveKeys.some(sk => key.toLowerCase().includes(sk))) {
        copy[key] = '[REDACTED]';
      } else if (typeof copy[key] === 'object' && copy[key] !== null && !Array.isArray(copy[key])) {
        copy[key] = this.redact(copy[key]);
      }
    }
    return copy;
  }

  log(message: any, context?: string) {
    super.log(this.formatMessageWithCorrelation(message), context);
  }

  error(message: any, trace?: string, context?: string) {
    super.error(this.formatMessageWithCorrelation(message), trace, context);
  }

  warn(message: any, context?: string) {
    super.warn(this.formatMessageWithCorrelation(message), context);
  }

  debug(message: any, context?: string) {
    super.debug(this.formatMessageWithCorrelation(message), context);
  }

  verbose(message: any, context?: string) {
    super.verbose(this.formatMessageWithCorrelation(message), context);
  }
}
