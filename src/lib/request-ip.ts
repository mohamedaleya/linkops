/**
 * Best-effort client IP for rate limiting.
 *
 * Production sits behind a reverse proxy (OpenResty / Nginx Proxy Manager)
 * that sets X-Real-IP and *appends* the real client address to
 * X-Forwarded-For. The left-most XFF entries are client-controlled, so using
 * them lets anyone bypass rate limits by sending a random header. Prefer
 * X-Real-IP, then the right-most XFF entry.
 */
export function getClientIp(request: Request): string {
  const realIp = request.headers.get('x-real-ip')?.trim();
  if (realIp) return realIp;

  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    const parts = forwarded
      .split(',')
      .map((p) => p.trim())
      .filter(Boolean);
    if (parts.length > 0) return parts[parts.length - 1];
  }

  return 'anonymous';
}
