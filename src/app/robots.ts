import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_URL || 'https://linkops.at';

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/dashboard', '/profile', '/p/', '/s/', '/go/'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
