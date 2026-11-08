/**
 * @jest-environment jsdom
 */

import { POST } from '../../app/api/security/rescan/route';
import { prisma } from '@/lib/prisma';

jest.mock('@/lib/prisma', () => ({
  prisma: {
    shortLink: {
      findMany: jest.fn(),
      update: jest.fn(),
    },
  },
}));
jest.mock('@/lib/cache', () => ({
  invalidateLinks: jest.fn(),
  invalidatePlatformStats: jest.fn(),
}));

const call = (token?: string) =>
  POST(
    new Request('http://localhost:3000/api/security/rescan', {
      method: 'POST',
      headers: token ? { authorization: `Bearer ${token}` } : {},
    })
  );

describe('POST /api/security/rescan', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.ANALYTICS_WORKER_SECRET = 'worker-secret';
    delete process.env.GOOGLE_SAFE_BROWSING_API_KEY;
    jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  it('rejects calls without the worker token', async () => {
    const response = await call();
    expect(response.status).toBe(401);
    expect(prisma.shortLink.findMany).not.toHaveBeenCalled();
  });

  it('never selects manually locked links', async () => {
    (prisma.shortLink.findMany as jest.Mock).mockResolvedValue([]);
    await call('worker-secret');
    const query = (prisma.shortLink.findMany as jest.Mock).mock.calls[0][0];
    expect(query.where.securityLocked).toBe(false);
  });

  it('flags links that now fail the safety rules', async () => {
    (prisma.shortLink.findMany as jest.Mock).mockResolvedValue([
      {
        id: '1',
        shortened_id: 'bad',
        originalUrl: 'https://x.twilightparadox.com/?verify',
        securityStatus: 'secure',
        userId: null,
      },
    ]);
    const response = await call('worker-secret');
    const body = await response.json();
    expect(body.newlyFlagged).toHaveLength(1);
    expect(prisma.shortLink.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: '1' },
        data: expect.objectContaining({
          securityStatus: 'unsafe',
          isPublic: false,
        }),
      })
    );
  });
});
