import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleIdentityService } from './google-identity.service';

describe('GoogleIdentityService', () => {
  const config = { getOrThrow: jest.fn().mockReturnValue('web-client-id') } as unknown as ConfigService;
  const service = new GoogleIdentityService(config);
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  it('returns only a verified identity for this OAuth client', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        aud: 'web-client-id',
        sub: 'google-subject',
        email: 'USER@example.com',
        email_verified: 'true',
        name: 'User Name',
      }),
    });

    await expect(service.verifyIdToken('signed-id-token')).resolves.toEqual({
      googleId: 'google-subject',
      email: 'user@example.com',
      name: 'User Name',
    });
  });

  it('rejects an ID token issued for another OAuth client', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        aud: 'attacker-client-id',
        sub: 'google-subject',
        email: 'user@example.com',
        email_verified: true,
      }),
    });

    await expect(service.verifyIdToken('signed-id-token')).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('rejects a token Google marks invalid', async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: false });

    await expect(service.verifyIdToken('expired-token')).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
