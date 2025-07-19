/**
 * 구조화된 데이터(JSON-LD) 스키마 생성 유틸리티
 */

import { NewsItem } from '@/types/news';
import { BASE_URL } from './siteConfig';

/**
 * 개별 뉴스 기사용 Article 스키마 생성
 */
export function generateArticleSchema(newsItem: NewsItem, category: string = '뉴스') {
  const baseSchema = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "headline": newsItem.title,
    "description": newsItem.content.substring(0, 160).trim() + (newsItem.content.length > 160 ? '...' : ''),
    "url": newsItem.url,
    "datePublished": newsItem.date,
    "dateModified": newsItem.date,
    "author": {
      "@type": "Organization",
      "name": newsItem.source || "인천논현라이프",
      "url": BASE_URL
    },
    "publisher": {
      "@type": "Organization",
      "name": "인천논현라이프",
      "url": BASE_URL,
      "logo": {
        "@type": "ImageObject",
        "url": `${BASE_URL}/logo.png`,
        "width": 400,
        "height": 400
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": newsItem.url
    },
    "articleSection": category,
    "keywords": [
      "논현동",
      "인천 남동구",
      newsItem.keyword || category,
      newsItem.source
    ].filter(Boolean),
    "about": {
      "@type": "Place",
      "name": "인천광역시 남동구 논현동",
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": 37.3894,
        "longitude": 126.7317
      }
    },
    "contentLocation": {
      "@type": "Place",
      "name": "인천광역시 남동구 논현동",
      "address": {
        "@type": "PostalAddress",
        "addressCountry": "KR",
        "addressRegion": "인천광역시",
        "addressLocality": "남동구",
        "streetAddress": "논현동"
      }
    }
  };

  // YouTube 컨텐츠인 경우 VideoObject 추가
  if (newsItem.type === 'youtube' && newsItem.thumbnail) {
    return {
      ...baseSchema,
      "@type": "VideoObject",
      "name": newsItem.title,
      "thumbnailUrl": newsItem.thumbnail,
      "uploadDate": newsItem.upload_time || newsItem.date,
      "duration": "PT0M", // 실제 영상 길이는 추후 추가 가능
      "interactionStatistic": newsItem.views ? {
        "@type": "InteractionCounter",
        "interactionType": "https://schema.org/WatchAction",
        "userInteractionCount": parseInt(newsItem.views.replace(/[^0-9]/g, '')) || 0
      } : undefined
    };
  }

  // 이미지가 있는 경우 추가
  if (newsItem.thumbnail) {
    return {
      ...baseSchema,
      "image": {
        "@type": "ImageObject",
        "url": newsItem.thumbnail,
        "width": 1200,
        "height": 630
      }
    };
  }

  return baseSchema;
}

/**
 * 뉴스 리스트용 ItemList 스키마 생성
 */
export function generateNewsListSchema(newsItems: NewsItem[], category: string = '전체') {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": `인천논현라이프 - ${category} 뉴스`,
    "description": `인천 남동구 논현동 ${category} 관련 최신 뉴스 및 정보`,
    "url": `${BASE_URL}/?category=${encodeURIComponent(category)}`,
    "numberOfItems": newsItems.length,
    "itemListElement": newsItems.slice(0, 10).map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "NewsArticle",
        "@id": item.url,
        "headline": item.title,
        "url": item.url,
        "datePublished": item.date,
        "author": {
          "@type": "Organization",
          "name": item.source || "인천논현라이프"
        }
      }
    }))
  };
}

interface RealEstateItem {
  apartment_name: string;
  area: string;
  floor: string;
  price_numeric: number;
  deal_date: string;
}

/**
 * 부동산 정보용 RealEstateListing 스키마 생성
 */
export function generateRealEstateSchema(realEstateData: RealEstateItem[]) {
  if (!realEstateData || realEstateData.length === 0) return null;

  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "인천 남동구 논현동 아파트 실거래가",
    "description": "논현동 아파트 실거래가 정보 - 최근 거래 내역",
    "url": `${BASE_URL}/?category=부동산`,
    "numberOfItems": realEstateData.length,
    "itemListElement": realEstateData.slice(0, 5).map((deal, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "RealEstateListing",
        "name": `${deal.apartment_name} ${deal.area} ${deal.floor}층`,
        "description": `${deal.apartment_name} ${deal.area} ${deal.floor}층 실거래가`,
        "price": {
          "@type": "PriceSpecification",
          "price": deal.price_numeric * 10000, // 만원 단위를 원 단위로 변환
          "priceCurrency": "KRW"
        },
        "floorSize": {
          "@type": "QuantitativeValue",
          "value": parseFloat(deal.area.replace('㎡', '')),
          "unitCode": "MTK" // 제곱미터
        },
        "address": {
          "@type": "PostalAddress",
          "addressCountry": "KR",
          "addressRegion": "인천광역시",
          "addressLocality": "남동구",
          "streetAddress": `논현동 ${deal.apartment_name}`
        },
        "geo": {
          "@type": "GeoCoordinates",
          "latitude": 37.3894,
          "longitude": 126.7317
        },
        "datePosted": deal.deal_date
      }
    }))
  };
}

interface MedicalFacility {
  name: string;
  address: string;
  phone?: string;
  specialty?: string;
  latitude?: number;
  longitude?: number;
}

/**
 * 의료기관 정보용 스키마 생성
 */
export function generateMedicalSchema(medicalData: MedicalFacility[], type: 'hospital' | 'pharmacy') {
  if (!medicalData || medicalData.length === 0) return null;

  const schemaType = type === 'hospital' ? 'Hospital' : 'Pharmacy';
  const name = type === 'hospital' ? '논현동 병원' : '논현동 약국';

  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": `인천 남동구 ${name} 정보`,
    "description": `논현동 및 인근 지역 ${name} 목록`,
    "url": `${BASE_URL}/?category=${type === 'hospital' ? '병원' : '약국'}`,
    "numberOfItems": medicalData.length,
    "itemListElement": medicalData.slice(0, 10).map((facility, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": schemaType,
        "name": facility.name,
        "address": {
          "@type": "PostalAddress",
          "addressCountry": "KR",
          "streetAddress": facility.address
        },
        "telephone": facility.phone,
        "medicalSpecialty": facility.specialty,
        "geo": facility.latitude && facility.longitude ? {
          "@type": "GeoCoordinates",
          "latitude": facility.latitude,
          "longitude": facility.longitude
        } : undefined
      }
    }))
  };
}

/**
 * BreadcrumbList 스키마 생성
 */
export function generateBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url
    }))
  };
}

/**
 * FAQ 스키마 생성
 */
export function generateFAQSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "논현동 실시간 뉴스는 어디서 볼 수 있나요?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "인천논현라이프에서 논현동 관련 실시간 뉴스, 블로그, 유튜브 영상을 모아서 볼 수 있습니다."
        }
      },
      {
        "@type": "Question",
        "name": "논현동 지하철 시간표를 확인할 수 있나요?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "네, 수인분당선 인천논현역, 호구포역의 실시간 지하철 시간표를 확인할 수 있습니다."
        }
      },
      {
        "@type": "Question",
        "name": "논현동 부동산 실거래가 정보가 있나요?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "국토교통부 공식 데이터를 기반으로 한 논현동 아파트 실거래가 정보를 제공합니다."
        }
      },
      {
        "@type": "Question",
        "name": "논현동 병원과 약국 정보를 찾을 수 있나요?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "논현동 및 인근 지역의 병원, 약국 정보와 진료시간, 연락처 등을 확인할 수 있습니다."
        }
      }
    ]
  };
}