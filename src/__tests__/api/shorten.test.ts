/**
 * @jest-environment jsdom
 */

import { POST } from '../../app/api/shorten/route';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

jest.mock('@/lib/prisma', () => ({
  prisma: {
    shortLink: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  },
}));
jest.mock('@/lib/auth', () => ({
  auth: { api: { getSession: jest.fn() } },
}));
jest.mock('next/headers', () => ({
  headers: jest.fn(async () => new Headers()),
}));
jest.mock('next/cache', () => ({ revalidatePath: jest.fn() }));
jest.mock('@/lib/rate-limiter', () => ({
  rateLimit: jest.fn().mockResolvedValue({
    success: true,
    limit: 10,
    remaining: 9,
    reset: Date.now() + 60000,
  }),
}));

const post = (body: Record<string, unknown>) =>
  POST(
    new Request('http://localhost:3000/api/shorten', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    })
  );

describe('POST /api/shorten', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    delete process.env.GOOGLE_SAFE_BROWSING_API_KEY;
    (auth.api.getSession as unknown as jest.Mock).mockResolvedValue({
      user: { id: 'user-1' },
    });
  });

  it('requires sign-in', async () => {
    (auth.api.getSession as unknown as jest.Mock).mockResolvedValue(null);
    const response = await post({ url: 'https://example.com' });
    expect(response.status).toBe(401);
    expect(prisma.shortLink.create).not.toHaveBeenCalled();
  });

  it('returns 400 if URL is not provided', async () => {
    const response = await post({});
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: 'URL is required' });
  });

  it('rejects unsafe destinations without storing them', async () => {
    const response = await post({ url: 'https://bit.ly/abc' });
    expect(response.status).toBe(422);
    expect(prisma.shortLink.create).not.toHaveBeenCalled();
  });

  it('rejects non-http schemes', async () => {
    const response = await post({ url: 'javascript:alert(1)' });
    expect(response.status).toBe(422);
  });

  it('rejects invalid custom slugs', async () => {
    const response = await post({
      url: 'https://example.com',
      customSlug: '../admin',
    });
    expect(response.status).toBe(400);
  });

  it('returns the existing link if the user already shortened the URL', async () => {
    (prisma.shortLink.findFirst as jest.Mock).mockResolvedValue({
      shortened_id: 'abc123',
    });
    const response = await post({ url: 'https://example.com' });
    expect(response.status).toBe(409);
    expect(await response.json()).toEqual({
      error: 'This URL has already been shortened',
      shortened_id: 'abc123',
    });
  });

  it('creates a new link owned by the user', async () => {
    (prisma.shortLink.findFirst as jest.Mock).mockResolvedValue(null);
    (prisma.shortLink.create as jest.Mock).mockResolvedValue({
      shortened_id: 'new123',
      isEncrypted: false,
    });
    const response = await post({ url: 'https://example.com' });
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      shortened_id: 'new123',
      isEncrypted: false,
      safetyWarning: null,
    });
    const data = (prisma.shortLink.create as jest.Mock).mock.calls[0][0].data;
    expect(data.userId).toBe('user-1');
    expect(data.securityStatus).toBe('unknown'); // no Safe Browsing key in tests
  });
});
