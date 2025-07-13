import type { Metadata } from 'next';
import { BASE_URL } from '@/lib/siteConfig';

export const metadata: Metadata = {
  title: '논현동 학원 정보 | 인천논현라이프',
  description: '인천시 남동구 논현동 학원·교습소(입시·보습, 예능, 외국어 등) 정보를 주소·전화번호와 함께 확인하세요.',
  alternates: { canonical: `${BASE_URL}/academy` },
  openGraph: {
    title: '논현동 학원 정보',
    description: '논현동 학원·교습소 리스트, 과목별 검색 제공',
    url: `${BASE_URL}/academy`,
    type: 'website',
    siteName: '인천논현라이프',
    images: [
      {
        url: `${BASE_URL}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: '논현동 학원 정보'
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '논현동 학원 정보',
    description: '논현동 학원·교습소 정보를 과목별로 검색',
    images: [`${BASE_URL}/og-image.jpg`]
  },
};

export default function AcademyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
} 