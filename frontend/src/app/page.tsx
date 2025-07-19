// 서버 컴포넌트로 변환 - SEO 메타데이터만 처리
import { generatePageMetadata } from '@/lib/seoUtils';
import HomeClient from './components/HomeClient';
import { Metadata } from 'next';

// 메타데이터 생성 (서버 사이드) - URL 파라미터 기반 동적 메타데이터
export async function generateMetadata({ 
  searchParams 
}: { 
  searchParams: { category?: string } 
}): Promise<Metadata> {
  const category = searchParams.category;
  
  if (category && category !== '전체') {
    return generatePageMetadata('category', { category });
  }
  
  return generatePageMetadata('home');
}

export default function HomePage() {
  return <HomeClient />;
}
