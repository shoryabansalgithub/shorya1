import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { CorrelationContextService } from '../correlation/correlation-context.service';

@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
  // Regex allows UUIDs or standard safe strings up to 100 chars to prevent header abuse
  private readonly safePattern = /^[a-zA-Z0-9\-_]{1,100}$/;

  use(req: Request, res: Response, next: NextFunction) {
    let correlationId = req.headers['x-correlation-id'] as string;

    // Validate format, reject large/malicious headers securely
    if (!correlationId || !this.safePattern.test(correlationId)) {
      correlationId = uuidv4();
    }

    // Attach to Request for traditional Express-like downstream code if needed
    (req as any).correlationId = correlationId;

    // Attach to Response Header for client to trace
    res.setHeader('x-correlation-id', correlationId);

    // Enter Async Context
    CorrelationContextService.asAsyncLocalStorage.run(correlationId, () => {
      next();
    });
  }
}
