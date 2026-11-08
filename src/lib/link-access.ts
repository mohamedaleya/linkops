import { createHmac, timingSafeEqual } from 'node:crypto';

/**
 * Signed "password verified" cookies for password-protected links.
 *
 * The old cookie was `verified_<id>=true`, which anyone could set by hand to
 * skip the password. The value is now `<expiry>.<hmac>` where the HMAC covers
 * the slug, the expiry and the current password hash, so it cannot be forged
 * and stops working as soon as the password changes.
 */

export const LINK_ACCESS_TTL_SECONDS = 3600;

function secret(): string {
  const s = process.env.BETTER_AUTH_SECRET;
  if (!s) throw new Error('BETTER_AUTH_SECRET is not set');
  return s;
}

export function linkAccessCookieName(shortenedId: string): string {
  return `verified_${shortenedId}`;
}

function sign(shortenedId: string, passwordHash: string, expiry: number) {
  return createHmac('sha256', secret())
    .update(`${shortenedId}|${passwordHash}|${expiry}`)
    .digest('hex');
}

export function createLinkAccessToken(
  shortenedId: string,
  passwordHash: string
): string {
  const expiry = Date.now() + LINK_ACCESS_TTL_SECONDS * 1000;
  return `${expiry}.${sign(shortenedId, passwordHash, expiry)}`;
}

export function verifyLinkAccessToken(
  token: string | undefined,
  shortenedId: string,
  passwordHash: string
): boolean {
  if (!token) return false;
  const [expiryStr, mac] = token.split('.');
  const expiry = Number(expiryStr);
  if (!mac || !Number.isFinite(expiry) || expiry < Date.now()) return false;

  const expected = Buffer.from(sign(shortenedId, passwordHash, expiry), 'hex');
  const given = Buffer.from(mac, 'hex');
  return given.length === expected.length && timingSafeEqual(given, expected);
}

/** Read a single cookie value from a raw Cookie header. */
export function readCookie(
  cookieHeader: string | null,
  name: string
): string | undefined {
  if (!cookieHeader) return undefined;
  for (const part of cookieHeader.split(';')) {
    const idx = part.indexOf('=');
    if (idx === -1) continue;
    if (part.slice(0, idx).trim() === name) {
      return decodeURIComponent(part.slice(idx + 1).trim());
    }
  }
  return undefined;
}
