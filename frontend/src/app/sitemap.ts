import { MetadataRoute } from 'next';
import { BASE_URL } from '@/lib/siteConfig';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = BASE_URL;
  const now = new Date();

  // 실제 존재하는 정적/동적 페이지 경로만 정의 (해시·쿼리 X)
  const paths: { path: string; priority: number; freq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never' }[] = [
    { path: '/', priority: 1.0, freq: 'hourly' },
    { path: '/privacy', priority: 0.3, freq: 'monthly' },
    { path: '/terms', priority: 0.3, freq: 'monthly' },
    { path: '/subway', priority: 0.8, freq: 'daily' },
    { path: '/realestate', priority: 0.8, freq: 'daily' },
    { path: '/academy', priority: 0.8, freq: 'daily' },
    { path: '/offline', priority: 0.1, freq: 'monthly' },
  ];

  return paths.map(({ path, priority, freq }) => ({
    url: `${baseUrl}${path}`,
    lastModified: now,
    changeFrequency: freq,
    priority,
  }));
} 