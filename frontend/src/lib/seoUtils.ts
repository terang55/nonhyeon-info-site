/**
 * SEO 관련 유틸리티 함수들
 * 구조화 데이터, 메타데이터 생성 등 SEO 최적화 기능을 제공합니다.
 */

import { NewsItem } from '@/types/news';

/**
 * 뉴스 리스트를 위한 구조화 데이터 생성 (JSON-LD)
 * @param news - 뉴스 아이템 배열
 * @param siteUrl - 사이트 기본 URL
 * @returns JSON-LD 구조화 데이터
 */
export function generateNewsStructuredData(
  news: NewsItem[], 
  siteUrl: string = 'https://nonhyeon.life'
): Record<string, unknown> | undefined {
  if (news.length === 0) return undefined;

  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "인천논현라이프 - 지역 뉴스 및 정보",
    "description": "인천 남동구 논현동의 최신 뉴스, 블로그, 유튜브 정보를 한눈에 확인하세요.",
    "url": siteUrl,
    "mainEntity": {
      "@type": "ItemList",
      "itemListElement": news.slice(0, 10).map((item, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "item": {
          "@type": "NewsArticle",
          "headline": item.title,
          "description": item.content,
          "url": item.url,
          "datePublished": item.date,
          "publisher": {
            "@type": "Organization",
            "name": item.source
          },
          "author": {
            "@type": "Organization",
            "name": item.source
          },
          "image": item.thumbnail || `${siteUrl}/og-image.jpg`,
          "articleSection": getArticleSection(item.type),
          "keywords": [item.keyword, "인천논현동", "남동구"].filter(Boolean).join(", ")
        }
      }))
    }
  };
}

/**
 * 지역 정보 사이트를 위한 LocalBusiness 구조화 데이터 생성
 * @param siteUrl - 사이트 기본 URL
 * @returns LocalBusiness JSON-LD 데이터
 */
export function generateLocalBusinessStructuredData(siteUrl: string = 'https://nonhyeon.life'): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "인천논현라이프",
    "description": "인천시 남동구 논현동 지역 정보 플랫폼",
    "url": siteUrl,
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "인천광역시",
      "addressRegion": "남동구",
      "addressCountry": "KR"
    },
    "areaServed": [
      {
        "@type": "Place",
        "name": "인천광역시 남동구 논현동"
      },
      {
        "@type": "Place", 
        "name": "에코메트로"
      },
      {
        "@type": "Place",
        "name": "소래포구"
      },
      {
        "@type": "Place",
        "name": "호구포"
      }
    ],
    "serviceType": "지역 정보 서비스",
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer service",
      "email": "rainbowcr55@gmail.com"
    }
  };
}

/**
 * 부동산 정보 페이지를 위한 구조화 데이터 생성
 * @param siteUrl - 사이트 기본 URL
 * @returns RealEstate JSON-LD 데이터
 */
export function generateRealEstateStructuredData(siteUrl: string = 'https://nonhyeon.life'): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "인천 논현동 부동산 실거래가 정보",
    "description": "인천 남동구 논현동 아파트 실거래가, 신규 거래, 시세 정보를 실시간으로 확인하세요.",
    "url": `${siteUrl}/realestate`,
    "mainEntity": {
      "@type": "RealEstateAgent",
      "name": "인천논현라이프 부동산 정보",
      "areaServed": {
        "@type": "Place",
        "name": "인천광역시 남동구 논현동"
      },
      "serviceType": "부동산 정보 제공"
    },
    "breadcrumb": {
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "홈",
          "item": siteUrl
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "부동산 정보",
          "item": `${siteUrl}/realestate`
        }
      ]
    }
  };
}

/**
 * 뉴스 타입을 ArticleSection으로 변환
 * @param type - 뉴스 타입
 * @returns 구조화 데이터용 섹션명
 */
function getArticleSection(type?: string): string {
  switch (type) {
    case 'news':
      return 'News';
    case 'blog':
      return 'Blog';
    case 'youtube':
      return 'Video';
    case 'cafe':
      return 'Community';
    default:
      return 'General';
  }
}

/**
 * 페이지별 메타데이터 생성
 * @param page - 페이지 타입
 * @param customData - 커스텀 데이터
 * @returns 메타데이터 객체
 */
export function generatePageMetadata(
  page: 'home' | 'realestate' | 'subway' | 'academy' | 'category',
  customData?: {
    title?: string;
    description?: string;
    keywords?: string[];
    image?: string;
    category?: string;
  }
) {
  const baseUrl = 'https://nonhyeon.life';
  const commonKeywords = [
    // 핵심 지역
    '인천논현동', '인천 논현동', '인천시 남동구 논현동', '남동구 논현동', '논현지구',
    // 주요 랜드마크
    '에코메트로', '소래포구', '호구포', '냇마을', '논현지구 중심상가',
    // 교통 (지하철역)
    '인천논현역', '호구포역', '소래포구역', '수인분당선',
    // 인근 지역
    '구월동', '간석동', '만수동', '장수서', '논현1동', '논현2동',
    // 주요 시설
    '남동구청', '논현도서관', '논현복지관', '논현초등학교', '논현중학교',
    // 생활편의시설
    '롯데마트 논현점', '이마트 논현점', '논현시장', 'CGV 논현',
    // 의료기관
    '인천적십자병원', '논현연세병원', '논현가정의학과',
    // 교육기관
    '논현어린이집', '논현유치원', '논현학원가'
  ];

  const pageConfig = {
    home: {
      title: '인천논현라이프 | 인천논현동 생활정보 플랫폼',
      description: '인천시 남동구 논현동 주민을 위한 실시간 뉴스, 지하철 정보, 부동산 정보, 의료 정보를 한눈에 확인하세요.',
      keywords: [
        ...commonKeywords,
        '인천논현동 뉴스', '인천논현동 맛집', '인천논현동 부동산', '인천논현동 병원'
      ],
      path: ''
    },
    realestate: {
      title: '인천 논현동 부동산 실거래가 | 인천논현라이프',
      description: '인천 남동구 논현동 아파트 실거래가, 신규 거래, 시세 정보를 실시간으로 확인하세요. 에코메트로, 냇마을 등 주요 단지 정보 제공.',
      keywords: [
        ...commonKeywords,
        '인천논현동 부동산', '인천논현동 아파트', '논현동 실거래가', '에코메트로 시세'
      ],
      path: '/realestate'
    },
    subway: {
      title: '인천 논현동 지하철 실시간 정보 | 인천논현라이프',
      description: '인천논현역, 호구포역, 소래포구역 실시간 지하철 도착 정보와 버스 정보를 확인하세요.',
      keywords: [
        ...commonKeywords,
        '인천논현역', '호구포역', '소래포구역', '수인분당선', '지하철 시간표'
      ],
      path: '/subway'
    },
    academy: {
      title: '인천 논현동 학원 정보 | 인천논현라이프',
      description: '인천 남동구 논현동 학원 정보, 교육 시설, 어린이집, 유치원 정보를 확인하세요.',
      keywords: [
        ...commonKeywords,
        '인천논현동 학원', '논현동 교육', '논현동 어린이집', '논현동 유치원'
      ],
      path: '/academy'
    },
    category: {
      title: '인천논현라이프 | 카테고리별 정보',
      description: '인천 남동구 논현동 카테고리별 최신 정보를 확인하세요.',
      keywords: [...commonKeywords],
      path: ''
    }
  };

  let config = pageConfig[page];
  
  // 카테고리별 메타데이터 처리
  if (page === 'category' && customData?.category) {
    config = generateCategoryMetadata(customData.category, commonKeywords);
  }
  
  const url = customData?.category 
    ? `${baseUrl}?category=${encodeURIComponent(customData.category)}`
    : `${baseUrl}${config.path}`;

  return {
    title: customData?.title || config.title,
    description: customData?.description || config.description,
    keywords: customData?.keywords || config.keywords,
    openGraph: {
      title: customData?.title || config.title,
      description: customData?.description || config.description,
      url,
      type: 'website',
      images: [
        {
          url: customData?.image || `${baseUrl}/og-image.jpg`,
          width: 1200,
          height: 630,
          alt: config.title,
        },
      ],
      siteName: '인천논현라이프',
      locale: 'ko_KR',
    },
    twitter: {
      card: 'summary_large_image',
      title: customData?.title || config.title,
      description: customData?.description || config.description,
      images: [customData?.image || `${baseUrl}/og-image.jpg`],
    },
    alternates: {
      canonical: url,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

/**
 * 카테고리별 메타데이터 생성
 * @param category - 카테고리명
 * @param commonKeywords - 공통 키워드
 * @returns 카테고리별 설정 객체
 */
interface PageConfig {
  title: string;
  description: string;
  keywords: string[];
  path: string;
}

function generateCategoryMetadata(category: string, commonKeywords: string[]): PageConfig {
  const categoryConfig: Record<string, PageConfig> = {
    '뉴스': {
      title: `인천 논현동 뉴스 | 인천논현라이프`,
      description: '인천 남동구 논현동 최신 뉴스와 지역 소식을 실시간으로 확인하세요.',
      keywords: [...commonKeywords, '인천논현동 뉴스', '논현동 소식', '남동구 뉴스', '지역뉴스'],
      path: '?category=뉴스'
    },
    '블로그': {
      title: `인천 논현동 블로그 | 인천논현라이프`,
      description: '인천 남동구 논현동 관련 블로그 포스트와 생활정보를 확인하세요.',
      keywords: [...commonKeywords, '인천논현동 블로그', '논현동 생활정보', '남동구 블로그'],
      path: '?category=블로그'
    },
    '유튜브': {
      title: `인천 논현동 유튜브 | 인천논현라이프`,
      description: '인천 남동구 논현동 관련 유튜브 영상과 동영상 콘텐츠를 확인하세요.',
      keywords: [...commonKeywords, '인천논현동 유튜브', '논현동 영상', '남동구 유튜브'],
      path: '?category=유튜브'
    },
    '병원': {
      title: `인천 논현동 병원 정보 | 인천논현라이프`,
      description: '인천 남동구 논현동 병원, 의원, 의료기관 정보와 진료시간을 확인하세요.',
      keywords: [...commonKeywords, '인천논현동 병원', '논현동 의원', '남동구 병원', '논현동 의료기관', '인천논현역 병원'],
      path: '?category=병원'
    },
    '약국': {
      title: `인천 논현동 약국 정보 | 인천논현라이프`,
      description: '인천 남동구 논현동 약국 정보와 운영시간, 위치 정보를 확인하세요.',
      keywords: [...commonKeywords, '인천논현동 약국', '논현동 약국', '남동구 약국', '인천논현역 약국'],
      path: '?category=약국'
    },
    '부동산': {
      title: `인천 논현동 부동산 | 인천논현라이프`,
      description: '인천 남동구 논현동 아파트 실거래가, 부동산 시세 정보를 확인하세요.',
      keywords: [...commonKeywords, '인천논현동 부동산', '논현동 아파트', '논현동 실거래가', '에코메트로 시세'],
      path: '?category=부동산'
    },
    '학원': {
      title: `인천 논현동 학원 정보 | 인천논현라이프`,
      description: '인천 남동구 논현동 학원, 교육기관, 어린이집 정보를 확인하세요.',
      keywords: [...commonKeywords, '인천논현동 학원', '논현동 학원', '남동구 학원', '논현동 교육'],
      path: '?category=학원'
    }
  };

  return categoryConfig[category] || {
    title: `인천 논현동 ${category} | 인천논현라이프`,
    description: `인천 남동구 논현동 ${category} 관련 정보를 확인하세요.`,
    keywords: [...commonKeywords, `인천논현동 ${category}`, `논현동 ${category}`],
    path: `?category=${category}`
  };
}

/**
 * 브레드크럼 구조화 데이터 생성
 * @param breadcrumbs - 브레드크럼 항목들
 * @param baseUrl - 기본 URL
 * @returns BreadcrumbList JSON-LD 데이터
 */
export function generateBreadcrumbStructuredData(
  breadcrumbs: Array<{ name: string; url: string }>,
  baseUrl: string = 'https://nonhyeon.life'
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbs.map((crumb, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": crumb.name,
      "item": crumb.url.startsWith('http') ? crumb.url : `${baseUrl}${crumb.url}`
    }))
  };
}

/**
 * FAQ 구조화 데이터 생성
 * @param faqs - FAQ 항목들
 * @returns FAQPage JSON-LD 데이터
 */
export function generateFAQStructuredData(
  faqs: Array<{ question: string; answer: string }>
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };
}