/**
 * 가이드 시스템 타입 정의 - 호환성 유지용
 * 실제 타입 정의는 @/types/guide.ts를 사용
 */

export type { GuideContent, GuideMetadata, GuideCategory } from '@/types/guide';

export interface GuideFrontMatter {
  title: string;
  description: string;
  keywords?: string[];
  tags?: string[];
  featured?: boolean;
  difficulty?: 'easy' | 'medium' | 'hard';
  readingTime?: number;
  lastUpdated?: string;
  relatedGuides?: string[];
  author?: string;
  [key: string]: unknown;
}

export interface GuideNavigation {
  previous?: {
    title: string;
    slug: string;
    category: string;
  };
  next?: {
    title: string;
    slug: string;
    category: string;
  };
}

export const GUIDE_CATEGORIES = {
  moving: {
    name: '이사/정착',
    description: '논현동 신규 입주자를 위한 정착 가이드',
    icon: '📋',
    color: 'blue'
  },
  realestate: {
    name: '부동산/주거',
    description: '부동산 정보와 주거 관련 가이드',
    icon: '🏠',
    color: 'green'
  },
  transportation: {
    name: '교통/이동',
    description: '지하철, 버스 등 교통 정보',
    icon: '🚇',
    color: 'purple'
  },
  lifestyle: {
    name: '일상생활/편의시설',
    description: '맛집, 쇼핑, 의료시설 등 생활 정보',
    icon: '🍽️',
    color: 'red'
  },
  seasonal: {
    name: '계절별 생활정보',
    description: '계절별 행사, 축제, 생활 팁',
    icon: '🌸',
    color: 'pink'
  },
  childcare: {
    name: '육아/가족',
    description: '육아, 가족 생활 관련 정보',
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

export type GuideCategorySlug = keyof typeof GUIDE_CATEGORIES;

export const DIFFICULTY_LABELS = {
  easy: { label: '쉬움', color: 'green', description: '5분 내 빠른 확인' },
  medium: { label: '보통', color: 'yellow', description: '10-15분 정독 권장' },
  hard: { label: '상세', color: 'red', description: '20분+ 꼼꼼히 읽기' }
} as const;