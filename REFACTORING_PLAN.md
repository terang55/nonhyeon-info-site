# 🏗️ 메인 페이지 리팩토링 계획

## 📊 현재 상태 분석

### 📏 코드 규모
- **파일**: `frontend/src/app/page.tsx`
- **라인 수**: 717줄
- **컴포넌트 타입**: 클라이언트 컴포넌트 (전체)
- **주요 문제**: 단일 책임 원칙 위반, 유지보수 어려움

### 🔍 기능 분석
현재 `page.tsx`에 포함된 주요 기능들:

1. **상태 관리** (77-84줄)
   - 뉴스 데이터 상태
   - 로딩/에러 상태
   - 카테고리 선택 상태
   - 동기화 상태

2. **데이터 페칭** (86-201줄)
   - 뉴스 API 호출
   - 동기화 상태 확인
   - 통계 데이터 가져오기

3. **유틸리티 함수** (203-333줄)
   - 날짜 포맷팅
   - 타입별 아이콘/레이블
   - 구조화 데이터 생성

4. **UI 렌더링** (335-716줄)
   - SEO 헤더
   - 네비게이션
   - 히어로 섹션
   - 필터링
   - 콘텐츠 그리드
   - 푸터

## 🎯 리팩토링 목표

### 1. **성능 최적화**
- Server Components 활용으로 JavaScript 번들 크기 감소
- 클라이언트 하이드레이션 최소화
- 코드 스플리팅 자동 적용

### 2. **유지보수성 향상**
- 단일 책임 원칙 적용
- 재사용 가능한 컴포넌트 생성
- 타입 안전성 강화

### 3. **개발 경험 개선**
- 컴포넌트별 독립적 개발/테스트
- 명확한 의존성 관계
- 더 나은 코드 가독성

## 📋 리팩토링 계획

### Phase 1: 유틸리티 분리
```typescript
// 🎯 목표: 재사용 가능한 유틸리티 함수들 분리

// lib/dateUtils.ts
export function formatDate(dateString: string, item?: NewsItem): string

// lib/newsUtils.ts  
export function getTypeIcon(type?: string): React.ReactNode
export function getTypeLabel(type?: string): string
export function getCategoryColor(type?: string): string

// lib/seoUtils.ts
export function generateNewsStructuredData(news: NewsItem[]): Record<string, unknown>
```

### Phase 2: 훅 분리
```typescript
// 🎯 목표: 비즈니스 로직을 커스텀 훅으로 분리

// hooks/useNews.ts
export function useNews(selectedCategory: string) {
  // 뉴스 데이터 페칭 로직
  return { news, loading, error, refetch };
}

// hooks/useSyncStatus.ts  
export function useSyncStatus() {
  // 동기화 상태 관리
  return { syncStatus, lastSync };
}

// hooks/useStats.ts
export function useStats() {
  // 통계 데이터 관리
  return { stats, loading };
}
```

### Phase 3: 컴포넌트 분리
```typescript
// 🎯 목표: UI 컴포넌트들을 작은 단위로 분리

// components/layout/Header.tsx (Server Component)
export default function Header({ syncStatus }: HeaderProps)

// components/layout/Navigation.tsx (Server Component) 
export default function Navigation()

// components/home/HeroSection.tsx (Server Component)
export default function HeroSection({ stats }: HeroSectionProps)

// components/home/CategoryFilter.tsx (Client Component)
export default function CategoryFilter({ 
  categories, 
  selectedCategory, 
  onCategoryChange 
}: CategoryFilterProps)

// components/news/NewsGrid.tsx (Client Component)
export default function NewsGrid({ 
  news, 
  loading, 
  error 
}: NewsGridProps)

// components/news/NewsCard.tsx (Server Component)
export default function NewsCard({ item }: NewsCardProps)

// components/layout/Footer.tsx (Server Component)
export default function Footer()
```

### Phase 4: 페이지 구조 재구성
```typescript
// 🎯 목표: 서버/클라이언트 컴포넌트 최적 분리

// app/page.tsx (Server Component) - 메타데이터, SEO
import { Metadata } from 'next';
import HomePageClient from './HomePageClient';

export const metadata: Metadata = {
  title: '인천논현라이프 | 인천논현동 생활정보 플랫폼',
  description: '...',
};

export default function HomePage() {
  return <HomePageClient />;
}

// app/HomePageClient.tsx (Client Component) - 상호작용
'use client';

export default function HomePageClient() {
  const { news, loading, error } = useNews(selectedCategory);
  const { syncStatus } = useSyncStatus();
  const { stats } = useStats();
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Header syncStatus={syncStatus} />
      <Navigation />
      <HeroSection stats={stats} />
      <CategoryFilter 
        categories={categories}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
      />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <NewsGrid news={news} loading={loading} error={error} />
      </main>
      <Footer />
    </div>
  );
}
```

## 📁 새로운 파일 구조

```
frontend/src/
├── app/
│   ├── page.tsx                 # 서버 컴포넌트 (메타데이터)
│   ├── HomePageClient.tsx       # 클라이언트 컴포넌트 (상호작용)
│   └── components/
│       ├── layout/
│       │   ├── Header.tsx       # 서버 컴포넌트
│       │   ├── Navigation.tsx   # 서버 컴포넌트  
│       │   └── Footer.tsx       # 서버 컴포넌트
│       ├── home/
│       │   ├── HeroSection.tsx  # 서버 컴포넌트
│       │   └── CategoryFilter.tsx # 클라이언트 컴포넌트
│       └── news/
│           ├── NewsGrid.tsx     # 클라이언트 컴포넌트
│           ├── NewsCard.tsx     # 서버 컴포넌트
│           └── EmptyState.tsx   # 서버 컴포넌트
├── hooks/
│   ├── useNews.ts
│   ├── useSyncStatus.ts
│   └── useStats.ts
├── lib/
│   ├── dateUtils.ts
│   ├── newsUtils.ts
│   ├── seoUtils.ts
│   └── env.ts                   # ✅ 이미 생성됨
└── types/
    ├── news.ts
    ├── api.ts
    └── common.ts
```

## 🎨 컴포넌트 설계 원칙

### 1. **Server Components 우선**
```typescript
// ✅ 서버 컴포넌트로 만들 수 있는 것들
- 정적 콘텐츠 (Header, Footer, HeroSection)
- 초기 데이터가 있는 컴포넌트 (NewsCard)
- SEO 관련 컴포넌트

// ⚠️ 클라이언트 컴포넌트가 필요한 것들  
- 상태를 가지는 컴포넌트 (CategoryFilter)
- 사용자 상호작용이 있는 컴포넌트 (NewsGrid)
- 브라우저 API를 사용하는 컴포넌트
```

### 2. **Props 인터페이스 정의**
```typescript
// types/news.ts
export interface NewsItem {
  title: string;
  content: string;
  source: string;
  date: string;
  url: string;
  keyword: string;
  content_length: number;
  type?: 'news' | 'blog' | 'youtube';
  channel?: string;
  views?: string;
  upload_time?: string;
  thumbnail?: string;
}

// types/api.ts
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  total: number;
  timestamp: string;
  note?: string;
}
```

### 3. **에러 경계 및 서스펜스**
```typescript
// components/ErrorBoundary.tsx
export default function ErrorBoundary({ children, fallback }: ErrorBoundaryProps)

// components/LoadingBoundary.tsx  
export default function LoadingBoundary({ children }: LoadingBoundaryProps)

// 사용 예시
<ErrorBoundary fallback={<ErrorFallback />}>
  <Suspense fallback={<NewsSkeleton />}>
    <NewsGrid />
  </Suspense>
</ErrorBoundary>
```

## 📊 예상 성능 개선

### 번들 크기 감소
- **현재**: 모든 로직이 클라이언트 번들에 포함
- **개선 후**: 서버 컴포넌트로 이동된 로직은 번들에서 제외
- **예상 감소**: 30-40% 번들 크기 감소

### 초기 로딩 시간 단축  
- **Server Components**: 서버에서 미리 렌더링
- **Code Splitting**: 필요한 컴포넌트만 로드
- **예상 개선**: LCP 20-30% 개선

### 개발자 경험 향상
- **컴포넌트별 독립 개발**: 병렬 작업 가능
- **명확한 관심사 분리**: 버그 추적 용이
- **재사용성 증가**: 다른 페이지에서 활용 가능

## 📅 실행 일정

### Week 1: 기반 작업
- [ ] 유틸리티 함수 분리
- [ ] 타입 정의 파일 생성
- [ ] 환경변수 검증 적용

### Week 2: 훅 및 로직 분리  
- [ ] 커스텀 훅 생성
- [ ] 비즈니스 로직 이동
- [ ] 테스트 코드 작성

### Week 3: 컴포넌트 분리
- [ ] 서버 컴포넌트 생성
- [ ] 클라이언트 컴포넌트 분리
- [ ] Props 인터페이스 정의

### Week 4: 통합 및 최적화
- [ ] 새로운 구조로 통합
- [ ] 성능 테스트 및 최적화
- [ ] 문서화 업데이트

---

> 💡 **핵심**: 점진적 리팩토링을 통해 기능 손실 없이 안전하게 개선합니다.