import { Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'node:async_hooks';

@Injectable()
export class CorrelationContextService {
  private static als = new AsyncLocalStorage<string>();

  static get asAsyncLocalStorage() {
    return this.als;
  }

  getCorrelationId(): string | undefined {
    return CorrelationContextService.als.getStore();
  }

  setCorrelationId(correlationId: string, callback: () => void): void {
    CorrelationContextService.als.run(correlationId, callback);
  }
}
