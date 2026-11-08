/**
 * @jest-environment jsdom
 */

import {
  checkLinkSafety,
  checkUrlHeuristics,
  validateSlug,
} from '@/lib/services/link-safety';

describe('checkUrlHeuristics', () => {
  it.each([
    'https://example.com',
    'https://www.essex.ac.uk/', // used to be blocked by the "sex" keyword
    'https://github.com/mohamedaleya/linkops',
    'http://example.org/path?q=1',
  ])('allows %s', (url) => {
    expect(checkUrlHeuristics(url)).toBeNull();
  });

  it.each([
    ['javascript:alert(1)', 'http and https'],
    ['data:text/html,<h1>x</h1>', 'http and https'],
    ['https://user:pass@example.com', 'credentials'],
    ['http://192.168.1.10/login', 'IP'],
    ['http://3232235777/', 'IP'], // integer-encoded IPv4
    ['https://bit.ly/abc', 'shorteners'],
    ['https://sub.tinyurl.com/x', 'shorteners'],
    ['https://linkops.at/s/abc', 'LinkOps'],
    // Real abusive links found in production (Nov 2026)
    ['https://hefinity.twilightparadox.com/?verify', 'dynamic-DNS'],
    ['https://rdrlink.top/alicesunbeam', 'shorteners'],
    ['https://qrcodeveloper.com/code/PKve9lp9IsrYsk-h', 'shorteners'],
    ['https://abc.trycloudflare.com/login', 'tunnel'],
    ['https://example.com/setup.exe', 'executable'],
    ['https://example.com/app.apk', 'executable'],
    ['https://www.pornhub.com/', 'Adult'],
    ['http://localhost:3000', 'local'],
    ['not a url', 'Invalid'],
  ])('rejects %s', (url, fragment) => {
    expect(checkUrlHeuristics(url)).toContain(fragment);
  });
});

describe('checkLinkSafety', () => {
  const realFetch = global.fetch;

  afterEach(() => {
    global.fetch = realFetch;
    delete process.env.GOOGLE_SAFE_BROWSING_API_KEY;
  });

  it('is "unknown" (allowed, rescanned later) without a Safe Browsing key', async () => {
    const result = await checkLinkSafety('https://example.com');
    expect(result.isHarmful).toBe(false);
    expect(result.securityStatus).toBe('unknown');
  });

  it('flags URLs matched by Safe Browsing', async () => {
    process.env.GOOGLE_SAFE_BROWSING_API_KEY = 'key';
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        matches: [{ threat: { url: 'https://evil.example/login' } }],
      }),
    }) as unknown as typeof fetch;

    const result = await checkLinkSafety('https://evil.example/login');
    expect(result.isHarmful).toBe(true);
    expect(result.securityStatus).toBe('unsafe');
  });

  it('marks clean https URLs as secure when Safe Browsing returns no match', async () => {
    process.env.GOOGLE_SAFE_BROWSING_API_KEY = 'key';
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({}),
    }) as unknown as typeof fetch;

    const result = await checkLinkSafety('https://example.com');
    expect(result.securityStatus).toBe('secure');
    expect(result.isVerified).toBe(true);
  });

  it('fails open to "unknown" when the API errors', async () => {
    process.env.GOOGLE_SAFE_BROWSING_API_KEY = 'key';
    global.fetch = jest
      .fn()
      .mockRejectedValue(new Error('network')) as unknown as typeof fetch;
    jest.spyOn(console, 'error').mockImplementation(() => {});

    const result = await checkLinkSafety('https://example.com');
    expect(result.securityStatus).toBe('unknown');
    expect(result.isHarmful).toBe(false);
  });
});

describe('validateSlug', () => {
  it.each(['abc', 'my-link_2', 'A'.repeat(64)])('accepts %s', (slug) => {
    expect(validateSlug(slug)).toBeNull();
  });

  it.each(['ab', 'a/b', '../x', 'has space', 'émoji', 'A'.repeat(65)])(
    'rejects %s',
    (slug) => {
      expect(validateSlug(slug)).not.toBeNull();
    }
  );
});
