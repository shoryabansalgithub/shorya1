import { BadRequestException } from '@nestjs/common';
import { WebhookManagementService } from './webhook-management.service';

describe('WebhookManagementService', () => {
  const prisma = {
    webhookEndpoint: {
      create: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
  };
  const service = new WebhookManagementService(prisma as any);

  beforeEach(() => jest.clearAllMocks());

  it.each(['http://example.com/hook', 'https://localhost/hook', 'https://127.0.0.1/hook', 'https://10.0.0.1/hook'])(
    'rejects unsafe webhook destination %s',
    async (url) => {
      await expect(service.registerWebhook('shop-1', url, ['inventory.updated']))
        .rejects.toBeInstanceOf(BadRequestException);
    },
  );

  it('returns endpoint metadata without its signing secret', async () => {
    prisma.webhookEndpoint.findMany.mockResolvedValue([]);

    await service.getWebhooks('shop-1');

    expect(prisma.webhookEndpoint.findMany).toHaveBeenCalledWith(expect.objectContaining({
      select: expect.not.objectContaining({ secret: true }),
    }));
  });
});
