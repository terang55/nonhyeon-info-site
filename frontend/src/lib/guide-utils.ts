import { GuideContent, GuideCategory, GuideMetadata } from '@/types/guide';

const BASE_URL = 'https://nonhyeon.life';

interface HowToStep {
  '@type': string;
  name: string;
  text: string;
  position: number;
}

export const GUIDE_CATEGORIES: GuideCategory[] = [
  {
    id: 'moving',
    name: '이사/정착',
    description: '논현동 신규 입주자를 위한 정착 가이드',
    icon: '📋',
    color: 'blue'
  },
  {
    id: 'realestate',
    name: '부동산/주거',
    description: '에코메트로 등 논현동 부동산 정보',
    icon: '🏠',
    color: 'green'
  },
  {
    id: 'transportation',
    name: '교통/이동',
    description: '수인분당선, 버스 등 교통 정보',
    icon: '🚇',
    color: 'purple'
  },
  {
    id: 'lifestyle',
    name: '생활정보',
    description: '맛집, 쇼핑, 의료시설 등 생활 정보',
    icon: '🍽️',
    color: 'red'
  }
];

// 논현동 특화 정적 가이드 데이터
export const STATIC_GUIDES: GuideContent[] = [
  {
    slug: 'new-resident-guide',
    title: '논현동 신규 입주자 완벽 가이드',
    description: '인천 남동구 논현동에 새로 이사오신 분들을 위한 완벽한 정착 가이드입니다. 관공서 업무부터 생활 인프라까지 모든 정보를 담았습니다.',
    keywords: ['논현동 이사', '논현동 정착', '에코메트로 입주', '남동구 이사', '논현동 신규입주자', '인천 논현동 생활'],
    content: '',
    category: 'moving',
    lastUpdated: '2025-01-21',
    relatedGuides: ['apartment-guide', 'subway-guide', 'restaurants'],
    readingTime: 15,
    difficulty: 'easy',
    tags: ['이사', '정착', '신규입주', '체크리스트', '관공서'],
    featured: true,
    rawContent: ''
  },
  {
    slug: 'apartment-guide',
    title: '에코메트로 아파트 완전 분석',
    description: '논현동 대표 아파트단지 에코메트로 3차~12차까지의 완벽한 분석 가이드입니다. 투자 가치부터 거주 환경까지 상세히 분석했습니다.',
    keywords: ['에코메트로', '논현동 아파트', '한화 에코메트로', '논현동 부동산', '에코메트로 시세', '에코메트로 분석'],
    content: '',
    category: 'realestate',
    lastUpdated: '2025-01-21',
    relatedGuides: ['new-resident-guide', 'subway-guide'],
    readingTime: 20,
    difficulty: 'medium',
    tags: ['아파트', '부동산', '에코메트로', '투자', '분석'],
    featured: true,
    rawContent: ''
  },
  {
    slug: 'subway-guide',
    title: '수인분당선 완전 활용법',
    description: '논현역, 호구포역, 소래포구역 이용 완벽 가이드입니다. 시간표부터 강남 출퇴근 꿀팁까지 모든 정보를 정리했습니다.',
    keywords: ['수인분당선', '논현역', '호구포역', '소래포구역', '논현동 지하철', '논현동 교통'],
    content: '',
    category: 'transportation',
    lastUpdated: '2025-01-21',
    relatedGuides: ['new-resident-guide', 'apartment-guide'],
    readingTime: 12,
    difficulty: 'easy',
    tags: ['교통', '지하철', '수인분당선', '시간표', '출퇴근'],
    featured: true,
    rawContent: ''
  },
  {
    slug: 'restaurants',
    title: '논현동 맛집 완전 정복',
    description: '현지인 추천! 논현동 숨은 맛집 20곳을 총정리했습니다. 가격대별, 분위기별로 완벽하게 분류한 맛집 가이드입니다.',
    keywords: ['논현동 맛집', '남동구 맛집', '에코메트로 맛집', '논현동 식당', '호구포 맛집', '소래포구 맛집'],
    content: '',
    category: 'lifestyle',
    lastUpdated: '2025-01-21',
    relatedGuides: ['new-resident-guide', 'subway-guide'],
    readingTime: 18,
    difficulty: 'easy',
    tags: ['맛집', '식당', '음식', '카페', '데이트', '가성비'],
    featured: true,
    rawContent: ''
  }
];

export function getGuidesByCategory(category?: string): GuideContent[] {
  let guides = STATIC_GUIDES;
  
  if (category && category !== 'all') {
    guides = guides.filter(guide => guide.category === category);
  }
  
  // 서버 환경에서는 실제 콘텐츠와 함께 반환
  if (typeof window === 'undefined') {
    try {
      const guidesWithContent = guides.map(guide => ({
        ...guide,
        content: '', // 목록에서는 빈 콘텐츠
        rawContent: ''
      }));
      return guidesWithContent.sort((a, b) => {
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
      });
    } catch (error) {
      console.error('가이드 목록 로드 실패:', error);
    }
  }
  
  // 클라이언트에서는 메타데이터만 반환
  const guidesWithPlaceholder = guides.map(guide => ({
    ...guide,
    content: '<p>콘텐츠를 로드하는 중...</p>',
    rawContent: '콘텐츠를 로드하는 중...'
  }));
  
  return guidesWithPlaceholder.sort((a, b) => {
    if (a.featured && !b.featured) return -1;
    if (!a.featured && b.featured) return 1;
    return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
  });
}

export function getGuideBySlug(slug: string): GuideContent | null {
  const guide = STATIC_GUIDES.find(guide => guide.slug === slug);
  if (!guide) {
    console.log(`❌ Guide not found in STATIC_GUIDES: ${slug}`);
    return null;
  }
  
  // 클라이언트에서는 메타데이터만 반환 (서버 컴포넌트에서 별도 처리)
  return {
    ...guide,
    content: '<p>콘텐츠를 로드하는 중...</p>',
    rawContent: '콘텐츠를 로드하는 중...'
  };
}

/**
 * 가이드 콘텐츠에서 단계별 정보를 추출하여 HowTo 스키마용 단계 생성
 */
function extractHowToSteps(guide: GuideContent): HowToStep[] {
  const steps = [];
  
  if (guide.category === 'moving') {
    steps.push(
      { name: '이사 전 준비', text: '논현동 지역 정보 조사 및 업체 선정하기' },
      { name: '행정 절차', text: '주민등록 이전 및 각종 변경 신고하기' },
      { name: '이사 당일', text: '짐 정리 및 새 집 확인하기' },
      { name: '이사 후 정착', text: '논현동 생활 인프라 파악 및 적응하기' }
    );
  } else if (guide.category === 'lifestyle') {
    if (guide.slug.includes('restaurants')) {
      steps.push(
        { name: '맛집 지역 파악', text: '에코메트로, 논현상가 등 주요 맛집가 위치 확인하기' },
        { name: '음식 종류별 정리', text: '한식, 중식, 일식, 양식별 추천 맛집 리스트 작성하기' },
        { name: '가격대별 선택', text: '예산에 맞는 가성비 또는 프리미엄 맛집 선정하기' },
        { name: '예약 및 방문', text: '필요한 경우 예약 후 실제 방문하여 맛집 경험하기' }
      );
    }
  } else if (guide.category === 'realestate') {
    steps.push(
      { name: '시장 조사', text: '논현동 부동산 시장 현황 및 에코메트로 시세 분석하기' },
      { name: '실거래가 확인', text: '국토교통부 공식 데이터로 실거래가 조사하기' },
      { name: '단지별 분석', text: '에코메트로 각 차수별 장단점 비교 분석하기' },
      { name: '투자 결정', text: '개인 상황에 맞는 최적 물건 선택하기' }
    );
  } else if (guide.category === 'transportation') {
    steps.push(
      { name: '교통편 조사', text: '수인분당선 논현역, 호구포역, 소래포구역 정보 파악하기' },
      { name: '교통카드 준비', text: '할인 혜택이 있는 교통카드 선택하기' },
      { name: '경로 최적화', text: '목적지별 최적 교통 경로 설정하기' },
      { name: '실시간 정보 활용', text: '지하철 앱으로 실시간 정보 확인하기' }
    );
  }

  return steps.map((step, index) => ({
    '@type': 'HowToStep',
    name: step.name,
    text: step.text,
    position: index + 1
  }));
}

export function generateGuideMetadata(guide: GuideContent): GuideMetadata {
  const canonicalUrl = `${BASE_URL}/guides/${guide.slug}`;
  const howToSteps = extractHowToSteps(guide);
  const categoryInfo = getCategoryInfo(guide.category);
  
  return {
    title: `${guide.title} | 논현동 정보`,
    description: guide.description,
    keywords: [
      ...(Array.isArray(guide.keywords) ? guide.keywords : []),
      '논현동',
      '인천 남동구',
      '에코메트로',
      '논현동 가이드',
      '논현동 생활정보',
      categoryInfo?.name || guide.category
    ],
    canonicalUrl,
    openGraph: {
      title: guide.title,
      description: guide.description,
      image: `${BASE_URL}/og-guide-${guide.category}.jpg`
    },
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: guide.title,
      name: guide.title,
      description: guide.description,
      author: {
        '@type': 'Organization',
        name: '논현동 정보',
        url: BASE_URL,
        logo: {
          '@type': 'ImageObject',
          url: `${BASE_URL}/logo.png`,
          width: 180,
          height: 60
        }
      },
      publisher: {
        '@type': 'Organization',
        name: '논현동 정보',
        logo: {
          '@type': 'ImageObject',
          url: `${BASE_URL}/logo.png`,
          width: 180,
          height: 60
        }
      },
      datePublished: guide.lastUpdated,
      dateModified: guide.lastUpdated,
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': canonicalUrl
      },
      image: {
        '@type': 'ImageObject',
        url: `${BASE_URL}/og-guide-${guide.category}.jpg`,
        width: 1200,
        height: 630
      },
      about: {
        '@type': 'Place',
        name: '인천 남동구 논현동',
        address: {
          '@type': 'PostalAddress',
          addressLocality: '인천',
          addressRegion: '남동구',
          addressCountry: 'KR'
        },
        geo: {
          '@type': 'GeoCoordinates',
          latitude: 37.3983,
          longitude: 126.7356
        }
      },
      keywords: guide.keywords,
      wordCount: Math.floor(guide.readingTime * 200), // 분당 200단어 추정
      timeRequired: `PT${guide.readingTime}M`,
      educationalLevel: guide.difficulty === 'easy' ? 'Beginner' : guide.difficulty === 'medium' ? 'Intermediate' : 'Advanced',
      inLanguage: 'ko-KR',
      isAccessibleForFree: true,
      genre: categoryInfo?.name || guide.category,
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '4.5',
        reviewCount: '85',
        bestRating: '5',
        worstRating: '1'
      }
    },
    howToSchema: {
      '@context': 'https://schema.org',
      '@type': 'HowTo',
      name: guide.title,
      description: guide.description,
      image: {
        '@type': 'ImageObject',
        url: `${BASE_URL}/og-guide-${guide.category}.jpg`,
        width: 1200,
        height: 630
      },
      totalTime: `PT${guide.readingTime}M`,
      estimatedCost: {
        '@type': 'MonetaryAmount',
        currency: 'KRW',
        value: '0'
      },
      step: howToSteps,
      tool: [
        {
          '@type': 'HowToTool',
          name: '스마트폰'
        },
        {
          '@type': 'HowToTool',
          name: '인터넷 연결'
        }
      ],
      supply: [
        {
          '@type': 'HowToSupply',
          name: '논현동 정보 가이드'
        }
      ]
    },
    faqSchema: generateFAQSchema(guide),
    localBusinessSchema: generateLocalBusinessSchema(guide)
  };
}

function generateFAQSchema(guide: GuideContent) {
  const faqs = [];
  
  if (guide.category === 'lifestyle') {
    faqs.push(
      {
        '@type': 'Question',
        name: `${guide.title}에서 가장 중요한 정보는 무엇인가요?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: guide.description
        }
      },
      {
        '@type': 'Question',
        name: '논현동에서 생활하기 좋은 이유는?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: '논현동은 에코메트로 아파트단지와 수인분당선 접근성이 좋으며, 소래포구와 인접하여 자연환경이 우수합니다.'
        }
      }
    );
  } else if (guide.category === 'realestate') {
    faqs.push(
      {
        '@type': 'Question',
        name: '에코메트로 아파트의 투자 전망은 어떤가요?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: '수인분당선 개통과 남동구 개발로 논현동과 에코메트로의 장기적 전망은 긍정적입니다.'
        }
      }
    );
  }
  
  if (faqs.length === 0) return null;
  
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs
  };
}

function generateLocalBusinessSchema(guide: GuideContent) {
  if (!guide.category.includes('restaurant') && !guide.category.includes('lifestyle')) {
    return null;
  }
  
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: '인천 남동구 논현동',
    address: {
      '@type': 'PostalAddress',
      streetAddress: '논현동',
      addressLocality: '인천',
      addressRegion: '남동구',
      postalCode: '21635',
      addressCountry: 'KR'
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 37.3983,
      longitude: 126.7356
    },
    url: BASE_URL,
    telephone: '+82-32-466-3114',
    priceRange: '$$',
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.3',
      reviewCount: '127'
    }
  };
}

export function getCategoryInfo(categoryId: string): GuideCategory | undefined {
  return GUIDE_CATEGORIES.find(cat => cat.id === categoryId);
}

export function getRelatedGuides(guide: GuideContent, limit = 3): GuideContent[] {
  const allGuides = getGuidesByCategory();
  
  return allGuides
    .filter(g => g.slug !== guide.slug)
    .filter(g => 
      g.category === guide.category || 
      (guide.relatedGuides && guide.relatedGuides.includes(g.slug)) ||
      (g.tags && guide.tags && g.tags.some(tag => guide.tags.includes(tag)))
    )
    .slice(0, limit);
}