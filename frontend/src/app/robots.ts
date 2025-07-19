import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://nonhyeon.life';
  
  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/api/rss',
          '/ads.txt',
          '/sw.js',
          '/site.webmanifest',
          '/favicon.ico',
          '/android-chrome-*.png',
          '/apple-touch-icon.png',
          '/sitemap.xml',
          '/robots.txt'
        ],
        disallow: [
          '/api/',
          '/_next/',
          '/admin/',
          '/data/',
          '/public/data/'
        ],
        crawlDelay: 1
      },
      // 검색엔진별 특별 규칙
      {
        userAgent: 'Googlebot',
        allow: [
          '/',
          '/api/rss'
        ],
        disallow: [
          '/api/',
          '/_next/',
          '/admin/',
          '/data/'
        ]
      },
      {
        userAgent: 'NaverBot',
        allow: [
          '/',
          '/api/rss'
        ],
        disallow: [
          '/api/',
          '/_next/',
          '/admin/',
          '/data/'
        ]
      },
      {
        userAgent: 'DaumBot',
        allow: [
          '/',
          '/api/rss'
        ],
        disallow: [
          '/api/',
          '/_next/',
          '/admin/',
          '/data/'
        ]
      }
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl
  };
}