export type SecurityStatus = 'secure' | 'unsafe' | 'unknown';

export interface SafetyCheckResult {
  isVerified: boolean;
  securityStatus: SecurityStatus;
  isHarmful: boolean;
}

export async function checkLinkSafety(url: string): Promise<SafetyCheckResult> {
  if (!url) {
    return { isVerified: false, securityStatus: 'unknown', isHarmful: false };
  }

  try {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';

    // Simulate safety check logic
    // In a real app, you'd call Google Safe Browsing API or similar here
    const harmfulKeywords = [
      'harmful',
      'malware',
      'phishing',
      'adult',
      'porn',
      'unsafe',
      'sex',
    ];

    // Check keywords and known adult domains
    const isHarmful =
      harmfulKeywords.some((keyword) => url.toLowerCase().includes(keyword)) ||
      url.toLowerCase().includes('pornhub.com') ||
      url.toLowerCase().includes('xvideos.com');

    let securityStatus: SecurityStatus = 'unknown';
    if (isHarmful) {
      securityStatus = 'unsafe';
    } else if (isHttps) {
      securityStatus = 'secure';
    }

    return {
      isVerified: !isHarmful && isHttps, // Simple verification rule: HTTPS and not harmful
      securityStatus,
      isHarmful,
    };
  } catch (error) {
    console.error('Error checking link safety:', error);
    return { isVerified: false, securityStatus: 'unknown', isHarmful: false };
  }
}
