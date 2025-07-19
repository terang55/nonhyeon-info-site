// 서버 컴포넌트로 변환 - SEO 메타데이터만 처리
import { generatePageMetadata } from '@/lib/seoUtils';
import HomeClient from './components/HomeClient';

// 메타데이터 생성 (서버 사이드)
export async function generateMetadata() {
  return generatePageMetadata('home');
}

export default function HomePage() {
  return <HomeClient />;
}
