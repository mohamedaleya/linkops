export type SecurityStatus = 'secure' | 'unsafe' | 'unknown';

export interface SafetyCheckResult {
  isVerified: boolean;
  securityStatus: SecurityStatus;
  isHarmful: boolean;
  /** Human-readable reason when the URL is rejected or flagged. */
  reason: string | null;
}

const SAFE_BROWSING_ENDPOINT =
  'https://safebrowsing.googleapis.com/v4/threatMatches:find';
const SAFE_BROWSING_BATCH_SIZE = 500; // API maximum per request
const SAFE_BROWSING_TIMEOUT_MS = 5000;
const SAFE_BROWSING_REASON =
  'This URL is listed by Google Safe Browsing as malicious or deceptive';

/**
 * Other URL shorteners. Chaining shorteners hides the real destination from
 * our checks (and from Google's), which is a classic phishing technique.
 */
const BLOCKED_SHORTENER_HOSTS = [
  'bit.ly',
  'bitly.com',
  'tinyurl.com',
  't.co',
  'goo.gl',
  'is.gd',
  'v.gd',
  'ow.ly',
  'buff.ly',
  'rebrand.ly',
  'cutt.ly',
  'shorturl.at',
  'rb.gy',
  'tiny.cc',
  'bl.ink',
  's.id',
  'shorte.st',
  'adf.ly',
  'qrco.de',
  'u.to',
  'clck.ru',
  'short.io',
  'tinyurl.is',
  // Redirect / dynamic-QR services seen abused on linkops.at
  'rdrlink.top',
  'qrcodeveloper.com',
  'linkr.bio',
];

/**
 * Free dynamic-DNS and tunnel domains. Anyone can get a subdomain in seconds,
 * which makes them a favourite for throwaway phishing pages. The link that
 * got linkops.at flagged pointed at a FreeDNS (afraid.org) subdomain.
 */
const FREE_HOSTING_DOMAINS = [
  // FreeDNS / afraid.org shared domains (most common ones)
  'twilightparadox.com',
  'mooo.com',
  'chickenkiller.com',
  'strangled.net',
  'crabdance.com',
  'jumpingcrab.com',
  'ignorelist.com',
  'us.to',
  // Other dynamic DNS providers
  'duckdns.org',
  'ddns.net',
  'hopto.org',
  'zapto.org',
  'sytes.net',
  'no-ip.org',
  'no-ip.biz',
  'serveo.net',
  'dynu.net',
  // Tunnels
  'ngrok.io',
  'ngrok-free.app',
  'ngrok.app',
  'trycloudflare.com',
  'loca.lt',
];

/** File types commonly used to deliver malware. */
const DANGEROUS_EXTENSIONS =
  /\.(exe|scr|msi|msp|bat|cmd|com|pif|vbs|vbe|jse|wsf|wsh|hta|cpl|jar|apk|xapk|dmg|pkg|iso|img|lnk|ps1|reg)$/i;

/** Adult-content tokens, matched against whole hostname labels only. */
const ADULT_HOST_TOKENS = new Set([
  'porn',
  'porno',
  'xxx',
  'xvideos',
  'pornhub',
  'xhamster',
  'xnxx',
  'redtube',
  'youporn',
]);

function ownHosts(): string[] {
  const hosts = ['linkops.at'];
  try {
    if (process.env.NEXT_PUBLIC_URL) {
      hosts.push(new URL(process.env.NEXT_PUBLIC_URL).hostname);
    }
  } catch {
    // ignore malformed env
  }
  return hosts;
}

function matchesHost(hostname: string, domain: string): boolean {
  return hostname === domain || hostname.endsWith(`.${domain}`);
}

function isIpLiteral(hostname: string): boolean {
  // IPv6 literals are bracketed in URLs; IPv4 is four dotted numbers.
  // WHATWG URL parsing normalises integer/hex IPv4 forms to dotted form.
  return hostname.startsWith('[') || /^\d{1,3}(\.\d{1,3}){3}$/.test(hostname);
}

function result(
  securityStatus: SecurityStatus,
  reason: string | null
): SafetyCheckResult {
  return {
    securityStatus,
    isHarmful: securityStatus === 'unsafe',
    isVerified: securityStatus === 'secure',
    reason,
  };
}

/**
 * Fast, offline checks. Returns a rejection reason, or null if nothing
 * suspicious was found.
 */
export function checkUrlHeuristics(url: string): string | null {
  let urlObj: URL;
  try {
    urlObj = new URL(url);
  } catch {
    return 'Invalid URL';
  }

  if (urlObj.protocol !== 'http:' && urlObj.protocol !== 'https:') {
    return 'Only http and https links are allowed';
  }

  const hostname = urlObj.hostname.toLowerCase();

  if (!hostname || !hostname.includes('.') || hostname === 'localhost') {
    return 'Links to local or internal addresses are not allowed';
  }

  if (urlObj.username || urlObj.password) {
    return 'Links containing embedded credentials are not allowed';
  }

  if (isIpLiteral(hostname)) {
    return 'Links to raw IP addresses are not allowed';
  }

  if (ownHosts().some((own) => matchesHost(hostname, own))) {
    return 'Links pointing back to LinkOps are not allowed';
  }

  if (BLOCKED_SHORTENER_HOSTS.some((d) => matchesHost(hostname, d))) {
    return 'Links to other URL shorteners are not allowed';
  }

  if (FREE_HOSTING_DOMAINS.some((d) => matchesHost(hostname, d))) {
    return 'Links to free dynamic-DNS or tunnel domains are not allowed';
  }

  if (DANGEROUS_EXTENSIONS.test(urlObj.pathname)) {
    return 'Direct links to executable or installer files are not allowed';
  }

  if (hostname.split(/[.-]/).some((label) => ADULT_HOST_TOKENS.has(label))) {
    return 'Adult content is not allowed';
  }

  return null;
}

const SLUG_PATTERN = /^[A-Za-z0-9_-]{3,64}$/;

/**
 * Validate a user-chosen slug. Returns an error message, or null when valid.
 * Slugs used to be unvalidated, so "a/b", "../x" or emoji were accepted and
 * produced short links that could never resolve.
 */
export function validateSlug(slug: string): string | null {
  if (!SLUG_PATTERN.test(slug)) {
    return 'Custom slug must be 3-64 characters: letters, numbers, - or _';
  }
  return null;
}

export function isSafeBrowsingConfigured(): boolean {
  return !!process.env.GOOGLE_SAFE_BROWSING_API_KEY;
}

/**
 * Look URLs up in Google Safe Browsing (v4 Lookup API).
 * Returns the set of URLs that matched a threat list, or null when the API
 * is not configured or the request failed (caller decides how to treat that).
 */
export async function lookupSafeBrowsing(
  urls: string[]
): Promise<Set<string> | null> {
  const apiKey = process.env.GOOGLE_SAFE_BROWSING_API_KEY;
  if (!apiKey || urls.length === 0) return null;

  const flagged = new Set<string>();

  for (let i = 0; i < urls.length; i += SAFE_BROWSING_BATCH_SIZE) {
    const batch = urls.slice(i, i + SAFE_BROWSING_BATCH_SIZE);
    try {
      const res = await fetch(
        `${SAFE_BROWSING_ENDPOINT}?key=${encodeURIComponent(apiKey)}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          // AbortSignal.timeout is missing in some runtimes (e.g. jsdom)
          signal:
            typeof AbortSignal.timeout === 'function'
              ? AbortSignal.timeout(SAFE_BROWSING_TIMEOUT_MS)
              : undefined,
          body: JSON.stringify({
            client: { clientId: 'linkops', clientVersion: '1.0.0' },
            threatInfo: {
              threatTypes: [
                'MALWARE',
                'SOCIAL_ENGINEERING',
                'UNWANTED_SOFTWARE',
                'POTENTIALLY_HARMFUL_APPLICATION',
              ],
              platformTypes: ['ANY_PLATFORM'],
              threatEntryTypes: ['URL'],
              threatEntries: batch.map((url) => ({ url })),
            },
          }),
        }
      );

      if (!res.ok) {
        console.error(`Safe Browsing lookup failed: HTTP ${res.status}`);
        return null;
      }

      const data = (await res.json()) as {
        matches?: { threat?: { url?: string } }[];
      };
      for (const match of data.matches ?? []) {
        if (match.threat?.url) flagged.add(match.threat.url);
      }
    } catch (error) {
      console.error('Safe Browsing lookup error:', error);
      return null;
    }
  }

  return flagged;
}

function statusForCleanUrl(url: string): SafetyCheckResult {
  return result(url.startsWith('https:') ? 'secure' : 'unknown', null);
}

/**
 * Safety check for many destination URLs at once.
 *
 * - Heuristic failures are unsafe.
 * - Safe Browsing matches are unsafe.
 * - When Safe Browsing is unavailable, clean URLs are "unknown": allowed, and
 *   re-checked later by the background rescan job.
 */
export async function checkLinksSafety(
  urls: string[]
): Promise<Map<string, SafetyCheckResult>> {
  const results = new Map<string, SafetyCheckResult>();
  const toLookup: string[] = [];

  for (const url of new Set(urls)) {
    const reason = checkUrlHeuristics(url);
    if (reason) {
      results.set(url, result('unsafe', reason));
    } else {
      toLookup.push(url);
    }
  }

  const flagged = await lookupSafeBrowsing(toLookup);
  for (const url of toLookup) {
    if (flagged?.has(url)) {
      results.set(url, result('unsafe', SAFE_BROWSING_REASON));
    } else if (flagged === null) {
      results.set(url, result('unknown', null));
    } else {
      results.set(url, statusForCleanUrl(url));
    }
  }

  return results;
}

/** Safety check for a single destination URL. */
export async function checkLinkSafety(url: string): Promise<SafetyCheckResult> {
  if (!url) {
    return result('unknown', null);
  }
  const results = await checkLinksSafety([url]);
  return results.get(url) ?? result('unknown', null);
}
