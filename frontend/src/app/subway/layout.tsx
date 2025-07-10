import type { Metadata } from 'next';
import { BASE_URL } from '@/lib/siteConfig';

export const metadata: Metadata = {
  title: '인천논현동 교통정보 - 지하철·버스 실시간 도착정보 | 인천논현라이프',
  description: '인천논현동 수인분당선 지하철(호구포역·인천논현역·소래포구역)과 M6410 광역버스 도착시간을 실시간으로 확인하세요.',
  alternates: { canonical: `${BASE_URL}/subway` },
  openGraph: {
    title: '논현동 실시간 지하철·버스 정보',
    description: '수인분당선 및 광역버스 실시간 도착 안내',
    url: `${BASE_URL}/subway`,
    type: 'website',
    siteName: '인천논현라이프',
    images: [
      {
        url: `${BASE_URL}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: '인천논현동 실시간 교통정보'
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '논현동 실시간 교통정보',
    description: '논현동 수인분당선·M6410 버스 실시간 도착 안내',
    images: [`${BASE_URL}/og-image.jpg`]
  },
};

export default function SubwayLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
} 