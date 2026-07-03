import { Injectable, ValidationPipe, ValidationError } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';

@Injectable()
export class SocketValidationPipe extends ValidationPipe {
  constructor() {
    super({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: (errors: ValidationError[]) => {
        const formatErrors = (errors: ValidationError[]): string[] => {
          const result: string[] = [];
          for (const error of errors) {
            if (error.constraints) {
              result.push(...Object.values(error.constraints));
            }
            if (error.children && error.children.length > 0) {
              result.push(...formatErrors(error.children));
            }
          }
          return result;
        };

        return new WsException({
          status: 'error',
          message: 'Validation failed',
          errors: formatErrors(errors),
        });
      },
    });
  }
}
