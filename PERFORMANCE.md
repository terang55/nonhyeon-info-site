# ⚡ 성능 최적화 가이드

## 📋 목차
- [현재 성능 현황](#현재-성능-현황)
- [Next.js 15 최적화](#nextjs-15-최적화)
- [이미지 최적화](#이미지-최적화)
- [번들 최적화](#번들-최적화)
- [캐싱 전략](#캐싱-전략)
- [Core Web Vitals](#core-web-vitals)
- [모니터링](#모니터링)

## 📊 현재 성능 현황

### 🎯 성능 목표
| 메트릭 | 목표값 | 현재값 | 상태 |
|--------|--------|--------|------|
| LCP (Largest Contentful Paint) | < 2.5s | - | 🔍 측정 필요 |
| FID (First Input Delay) | < 100ms | - | 🔍 측정 필요 |
| CLS (Cumulative Layout Shift) | < 0.1 | - | 🔍 측정 필요 |
| TTFB (Time to First Byte) | < 800ms | - | 🔍 측정 필요 |

### 📈 성능 측정 도구
```bash
# Lighthouse 감사
npx lighthouse https://nonhyeon.life --output=html

# 번들 분석
npm install --save-dev @next/bundle-analyzer
```

## 🚀 Next.js 15 최적화

### 1. React Server Components (RSC) 활용
```typescript
// ✅ 서버 컴포넌트로 변환 가능한 컴포넌트들
// - 정적 콘텐츠
// - 데이터 페칭 로직
// - SEO 메타데이터

// 현재 클라이언트 컴포넌트 (page.tsx - 717줄)
'use client';

// ✅ 리팩토링 제안: 서버/클라이언트 분리
// server/HomePage.tsx (서버 컴포넌트)
// client/HomePageClient.tsx (클라이언트 컴포넌트)
```

### 2. 컴포넌트 분리 전략
```typescript
// ❌ 현재: 거대한 단일 컴포넌트 (717줄)
export default function HomePage() {
  // 모든 로직이 한 곳에...
}

// ✅ 제안: 모듈화된 구조
export default function HomePage() {
  return (
    <>
      <HeroSection />      // 서버 컴포넌트
      <NewsSection />      // 클라이언트 컴포넌트
      <WeatherWidget />    // 클라이언트 컴포넌트
      <FooterSection />    // 서버 컴포넌트
    </>
  );
}
```

### 3. 동적 임포트 최적화
```typescript
// ✅ 코드 스플리팅 적용
import dynamic from 'next/dynamic';

const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <ComponentSkeleton />,
  ssr: false, // 클라이언트에서만 로드
});

// ✅ 조건부 로딩
const ChartComponent = dynamic(() => import('./Chart'), {
  loading: () => <div>차트 로딩 중...</div>,
});
```

## 🖼️ 이미지 최적화

### 1. Next.js Image 컴포넌트 활용
```typescript
// ✅ 현재 구현 (이미 적용됨)
import Image from 'next/image';

<Image 
  src={item.thumbnail} 
  alt={item.title}
  fill
  className="object-cover"
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
/>
```

### 2. 이미지 최적화 설정 개선
```typescript
// next.config.ts 최적화
images: {
  formats: ['image/webp', 'image/avif'], // ✅ 이미 적용됨
  minimumCacheTTL: 31536000, // 1년 캐싱 ✅
  deviceSizes: [640, 750, 828, 1080, 1200, 1920], // 반응형 크기
  
  // 🔧 추가 최적화
  unoptimized: false,
  dangerouslyAllowSVG: true,
  contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
}
```

### 3. YouTube 썸네일 최적화
```typescript
// ✅ 현재: 다양한 YouTube CDN 도메인 지원
// 🔧 개선 제안: 썸네일 크기별 로딩
const getOptimalThumbnail = (videoId: string, size: 'small' | 'medium' | 'large') => {
  const sizeMap = {
    small: 'mqdefault',   // 320x180
    medium: 'hqdefault', // 480x360  
    large: 'maxresdefault' // 1280x720
  };
  return `https://i.ytimg.com/vi/${videoId}/${sizeMap[size]}.jpg`;
};
```

## 📦 번들 최적화

### 1. 번들 분석 도구 설정
```javascript
// next.config.ts에 추가
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer(nextConfig);
```

```bash
# 번들 분석 실행
ANALYZE=true npm run build
```

### 2. 의존성 최적화
```json
// package.json 최적화 제안
{
  "dependencies": {
    // ✅ 필수 라이브러리만 유지
    "next": "15.3.4",
    "react": "^19.0.0",
    
    // 🔧 트리 쉐이킹 가능한 라이브러리 사용
    "date-fns": "^4.1.0", // moment.js 대신
    "lucide-react": "^0.523.0" // 아이콘 최적화
  }
}
```

### 3. 실험적 기능 활용
```typescript
// next.config.ts
experimental: {
  optimizePackageImports: ['lucide-react'], // ✅ 이미 적용됨
  
  // 🔧 추가 최적화
  optimizeCss: true,
  turbo: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },
},
```

## 🗄️ 캐싱 전략

### 1. API 캐싱 개선
```typescript
// ✅ 현재 Vercel 헤더 설정
{
  "source": "/api/news",
  "headers": [{ "key": "Cache-Control", "value": "public, max-age=300" }]
}

// 🔧 데이터별 캐싱 전략
const cacheStrategies = {
  realtimeData: 'max-age=60',      // 실시간 교통정보 (1분)
  newsData: 'max-age=300',         // 뉴스 (5분) ✅
  staticData: 'max-age=3600',      // 정적 정보 (1시간)
  images: 'max-age=31536000',      // 이미지 (1년) ✅
};
```

### 2. React Query/SWR 도입 검토
```typescript
// 🔧 클라이언트 사이드 캐싱 개선
import useSWR from 'swr';

function NewsComponent() {
  const { data, error, isLoading } = useSWR(
    '/api/news',
    fetcher,
    {
      refreshInterval: 300000, // 5분마다 재검증
      revalidateOnFocus: false,
      dedupingInterval: 60000,  // 1분 내 중복 요청 방지
    }
  );
}
```

### 3. 서비스 워커 캐싱
```javascript
// public/sw.js 개선
const CACHE_STRATEGIES = {
  '/api/news': 'stale-while-revalidate',
  '/api/weather': 'network-first',
  '/images/': 'cache-first',
  '/static/': 'cache-first',
};
```

## 🎯 Core Web Vitals

### 1. LCP (Largest Contentful Paint) 최적화
```typescript
// ✅ 이미지 우선순위 설정
<Image 
  src={heroImage}
  alt="Hero"
  priority // LCP 이미지에 적용
  sizes="100vw"
/>

// 🔧 중요한 CSS 인라인화
<style jsx>{`
  .hero-section {
    /* Critical CSS */
  }
`}</style>
```

### 2. CLS (Cumulative Layout Shift) 방지
```css
/* ✅ 이미지 컨테이너 크기 예약 */
.image-container {
  aspect-ratio: 16/9; /* 레이아웃 시프트 방지 */
}

/* 🔧 스켈레톤 UI 적용 */
.skeleton {
  background: linear-gradient(90deg, #f0f0f0 25%, transparent 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
}
```

### 3. INP (Interaction to Next Paint) 개선
```typescript
// 🔧 디바운싱 적용
import { useDebouncedCallback } from 'use-debounce';

const debouncedSearch = useDebouncedCallback(
  (searchTerm) => {
    // 검색 로직
  },
  300
);

// 🔧 가상화 적용 (긴 목록)
import { FixedSizeList as List } from 'react-window';
```

## 📊 모니터링

### 1. 성능 메트릭 수집
```typescript
// lib/analytics.ts
export function reportWebVitals(metric: any) {
  switch (metric.name) {
    case 'CLS':
    case 'FID': 
    case 'FCP':
    case 'LCP':
    case 'TTFB':
      // 분석 도구로 전송
      analytics.track('Web Vital', {
        name: metric.name,
        value: metric.value,
        id: metric.id,
      });
      break;
  }
}
```

### 2. 실시간 모니터링 설정
```bash
# Vercel Analytics (권장)
npm i @vercel/analytics

# 또는 Google Analytics 4
npm i gtag
```

### 3. 성능 예산 설정
```javascript
// .lighthouserc.js
module.exports = {
  ci: {
    collect: {
      numberOfRuns: 3,
    },
    assert: {
      assertions: {
        'categories:performance': ['warn', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['warn', { minScore: 0.9 }],
        'categories:seo': ['error', { minScore: 0.9 }],
      },
    },
  },
};
```

## 📋 성능 최적화 체크리스트

### 🏗️ 아키텍처
- [ ] 서버/클라이언트 컴포넌트 최적 분리
- [ ] 코드 스플리팅 적용
- [ ] 동적 임포트 활용
- [ ] 번들 크기 모니터링

### 🖼️ 리소스
- [ ] Next.js Image 컴포넌트 사용
- [ ] WebP/AVIF 이미지 포맷
- [ ] 적절한 이미지 크기 설정
- [ ] 폰트 최적화

### 🗄️ 캐싱
- [ ] API 응답 캐싱
- [ ] 정적 리소스 캐싱
- [ ] CDN 활용
- [ ] 브라우저 캐싱 전략

### 📊 측정
- [ ] Core Web Vitals 모니터링
- [ ] 실시간 성능 추적
- [ ] 성능 예산 설정
- [ ] 정기적인 성능 감사

---

> 💡 **팁**: 성능 최적화는 지속적인 과정입니다. 정기적으로 메트릭을 확인하고 개선점을 찾아 적용하세요.