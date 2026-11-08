/**
 * @jest-environment jsdom
 */

import { GET as getS } from '../../app/s/[id]/route';
import { GET as getGo } from '../../app/go/[id]/route';
import { getLink } from '@/lib/cache';
import { createLinkAccessToken } from '@/lib/link-access';

jest.mock('@/lib/rate-limiter', () => ({
  rateLimit: jest.fn().mockResolvedValue({
    success: true,
    limit: 100,
    remaining: 99,
    reset: Date.now() + 60000,
  }),
}));
jest.mock('@/lib/cache', () => ({ getLink: jest.fn() }));
jest.mock('@/lib/queue', () => ({ enqueueAnalytics: jest.fn() }));

const baseLink = {
  id: '1',
  shortened_id: 'abc123',
  originalUrl: 'https://example.com',
  visits: 0,
  redirectType: '307',
  isEnabled: true,
  expiresAt: null,
  passwordHash: null,
  isEncrypted: false,
  securityStatus: 'secure',
};

const call = (
  handler: typeof getS,
  id: string,
  init?: RequestInit
): Promise<Response> =>
  handler(new Request(`http://localhost:3000/s/${id}`, init), {
    params: Promise.resolve({ id }),
  });

describe.each([
  ['/s/[id]', getS],
  ['/go/[id]', getGo],
])('GET %s', (_name, handler) => {
  beforeAll(() => {
    process.env.BETTER_AUTH_SECRET = 'test-secret';
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('redirects to the original URL', async () => {
    (getLink as jest.Mock).mockResolvedValue(baseLink);
    const response = await call(handler, 'abc123');
    expect(response.status).toBe(307);
    expect(response.headers.get('Location')).toBe('https://example.com');
  });

  it('redirects to link-not-found if the slug does not exist', async () => {
    (getLink as jest.Mock).mockResolvedValue(null);
    const response = await call(handler, 'nonexistent');
    expect(response.headers.get('Location')).toContain('/link-not-found');
  });

  it('never redirects to an unsafe link, even with ?bypass=true', async () => {
    (getLink as jest.Mock).mockResolvedValue({
      ...baseLink,
      securityStatus: 'unsafe',
    });
    const response = await handler(
      new Request('http://localhost:3000/s/abc123?bypass=true'),
      { params: Promise.resolve({ id: 'abc123' }) }
    );
    expect(response.headers.get('Location')).toContain('/warning/abc123');
  });

  it('sends password-protected links to the password page', async () => {
    (getLink as jest.Mock).mockResolvedValue({
      ...baseLink,
      passwordHash: 'hash',
    });
    const response = await call(handler, 'abc123', {
      headers: { cookie: 'verified_abc123=true' }, // old forgeable cookie
    });
    expect(response.headers.get('Location')).toContain('/p/abc123');
  });

  it('accepts a valid signed password cookie', async () => {
    (getLink as jest.Mock).mockResolvedValue({
      ...baseLink,
      passwordHash: 'hash',
    });
    const token = createLinkAccessToken('abc123', 'hash');
    const response = await call(handler, 'abc123', {
      headers: { cookie: `verified_abc123=${token}` },
    });
    expect(response.headers.get('Location')).toBe('https://example.com');
  });

  it('returns 500 on unexpected errors', async () => {
    (getLink as jest.Mock).mockRejectedValue(new Error('Database error'));
    const response = await call(handler, 'error');
    expect(response.status).toBe(500);
  });
});
