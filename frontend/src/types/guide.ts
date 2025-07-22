/**
 * 가이드 시스템 타입 정의 - 논현동 특화
 */

export interface GuideContent {
  title: string;
  slug: string;
  description: string;
  category: string;
  keywords: string[];
  tags: string[];
  featured: boolean;
  difficulty: 'easy' | 'medium' | 'hard';
  readingTime: number;
  lastUpdated: string;
  content: string;        // HTML 변환된 콘텐츠
  rawContent: string;     // 원본 마크다운
  relatedGuides: string[];
  seasonal?: {
    season: 'spring' | 'summer' | 'fall' | 'winter' | 'all';
    months: number[];
  };
}

export interface GuideCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
}

export interface GuideMetadata {
  title: string;
  description: string;
  keywords: string[];
  canonicalUrl: string;
  openGraph: {
    title: string;
    description: string;
    image: string;
  };
  structuredData: Record<string, unknown>;
  howToSchema: Record<string, unknown>;
  faqSchema?: Record<string, unknown>;
  localBusinessSchema?: Record<string, unknown>;
}

export interface TocItem {
  id: string;
  text: string;
  level: number;
  children?: TocItem[];
}

// 론현동 가이드 카테고리 상수
export const NONHYEON_GUIDE_CATEGORIES = {
  moving: {
    name: '이사/정착',
    description: '논현동 신규 입주자를 위한 정착 가이드',
    icon: '📋',
    color: 'blue'
  },
  realestate: {
    name: '부동산/주거',
    description: '에코메트로 등 논현동 부동산 정보',
    icon: '🏠',
    color: 'green'
  },
  transportation: {
    name: '교통/이동',
    description: '수인분당선, 버스 등 교통 정보',
    icon: '🚇',
    color: 'purple'
  },
  lifestyle: {
    name: '생활정보',
    description: '맛집, 쇼핑, 의료시설 등 생활 정보',
    icon: '🍽️',
    color: 'red'
  },
  seasonal: {
    name: '계절별 정보',
    description: '소래포구 축제 등 계절별 활동',
    icon: '🌸',
    color: 'pink'
  },
  childcare: {
    name: '육아/가족',
    description: '육아시설, 키즈카페 등 가족 정보',
    icon: '👶',
    color: 'yellow'
  },
  education: {
    name: '교육/학습',
    description: '학교, 학원, 교육 시설 정보',
    icon: '🏫',
    color: 'indigo'
  }
} as const;

export type GuideCategorySlug = keyof typeof NONHYEON_GUIDE_CATEGORIES;

export const DIFFICULTY_LABELS = {
  easy: { label: '쉬움', color: 'green', description: '5분 내 빠른 확인' },
  medium: { label: '보통', color: 'yellow', description: '10-15분 정독 권장' },
  hard: { label: '상세', color: 'red', description: '20분+ 꼼꼼히 읽기' }
} as const;