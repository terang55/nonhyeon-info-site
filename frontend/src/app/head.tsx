import { BASE_URL } from '@/lib/siteConfig';

export default function Head() {
  return (
    <>
      <title>인천논현라이프 | 논현동 생활정보·뉴스·부동산·교통</title>
      <meta
        name="description"
        content="인천 남동구 논현동 주민을 위한 실시간 뉴스, 부동산 시세, 지하철·버스 교통, 학원·의료 정보를 한눈에 확인하세요."
      />
      {/* Canonical */}
      <link rel="canonical" href={BASE_URL} />

      {/* Open Graph */}
      <meta property="og:title" content="인천논현라이프 | 논현동 생활정보 플랫폼" />
      <meta
        property="og:description"
        content="논현동 뉴스·맛집·부동산·교통·학원·의료 정보 등 지역 생활 정보를 실시간으로 제공합니다."
      />
      <meta property="og:url" content={BASE_URL} />
      <meta property="og:type" content="website" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content="인천논현라이프 | 논현동 생활정보 플랫폼" />
      <meta
        name="twitter:description"
        content="논현동 실시간 뉴스·부동산·교통·의료 정보를 한눈에 확인하세요."
      />
    </>
  );
} 