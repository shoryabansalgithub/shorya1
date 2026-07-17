import { WebhookDispatcherService } from './webhook-dispatcher.service';

describe('WebhookDispatcherService', () => {
  const prisma = {
    webhookEndpoint: { findMany: jest.fn() },
    webhookDelivery: { create: jest.fn() },
  };
  const service = new WebhookDispatcherService(prisma as any);
  const originalFetch = global.fetch;

  beforeEach(() => jest.clearAllMocks());
  afterEach(() => { global.fetch = originalFetch; });

  it('delivers subscribed events and records a successful audit record', async () => {
    prisma.webhookEndpoint.findMany.mockResolvedValue([
      { id: 'endpoint-1', url: 'https://hooks.example.com/dukaan', secret: 'webhook-secret', events: ['product.updated'] },
      { id: 'endpoint-2', url: 'https://hooks.example.com/ignored', secret: 'other-secret', events: ['invoice.created'] },
    ]);
    global.fetch = jest.fn().mockResolvedValue({ ok: true, status: 204 });

    await service.dispatch('shop-1', 'product.updated', { id: 'product-1' }, 'event-1');

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(prisma.webhookDelivery.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ endpointId: 'endpoint-1', eventId: 'event-1', status: 'SUCCESS' }),
    }));
  });

  it('records a failed delivery and propagates the failure for retry', async () => {
    prisma.webhookEndpoint.findMany.mockResolvedValue([
      { id: 'endpoint-1', url: 'https://hooks.example.com/dukaan', secret: 'webhook-secret', events: ['*'] },
    ]);
    global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 503 });

    await expect(service.dispatch('shop-1', 'product.updated', {}, 'event-1')).rejects.toThrow('HTTP 503');
    expect(prisma.webhookDelivery.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ status: 'FAILED' }),
    }));
  });
});
