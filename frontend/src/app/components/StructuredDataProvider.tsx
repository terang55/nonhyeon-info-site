/**
 * 구조화된 데이터 제공 컴포넌트
 * 페이지별로 적절한 JSON-LD 스키마를 동적으로 추가합니다.
 */

'use client';

import { useEffect } from 'react';
import { NewsItem } from '@/types/news';
import { 
  generateNewsListSchema, 
  generateRealEstateSchema, 
  generateMedicalSchema,
  generateBreadcrumbSchema 
} from '@/lib/structuredData';

interface RealEstateData {
  apartment_name: string;
  area: string;
  floor: string;
  price_numeric: number;
  deal_date: string;
}

interface MedicalData {
  name: string;
  address: string;
  phone?: string;
  specialty?: string;
  latitude?: number;
  longitude?: number;
}

interface StructuredDataProviderProps {
  newsItems?: NewsItem[];
  category?: string;
  realEstateData?: RealEstateData[];
  medicalData?: MedicalData[];
  medicalType?: 'hospital' | 'pharmacy';
  breadcrumbs?: { name: string; url: string }[];
}

export default function StructuredDataProvider({
  newsItems,
  category = '전체',
  realEstateData,
  medicalData,
  medicalType,
  breadcrumbs
}: StructuredDataProviderProps) {
  
  useEffect(() => {
    // 기존 동적 스키마 제거
    const existingSchemas = document.querySelectorAll('script[data-structured-data="dynamic"]');
    existingSchemas.forEach(schema => schema.remove());

    const schemas: Record<string, unknown>[] = [];

    // 뉴스 리스트 스키마
    if (newsItems && newsItems.length > 0) {
      schemas.push(generateNewsListSchema(newsItems, category));
    }

    // 부동산 스키마
    if (realEstateData && realEstateData.length > 0) {
      const realEstateSchema = generateRealEstateSchema(realEstateData);
      if (realEstateSchema) schemas.push(realEstateSchema);
    }

    // 의료기관 스키마
    if (medicalData && medicalData.length > 0 && medicalType) {
      const medicalSchema = generateMedicalSchema(medicalData, medicalType);
      if (medicalSchema) schemas.push(medicalSchema);
    }

    // Breadcrumb 스키마
    if (breadcrumbs && breadcrumbs.length > 1) {
      schemas.push(generateBreadcrumbSchema(breadcrumbs));
    }

    // 스키마들을 DOM에 추가
    schemas.forEach((schema, index) => {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.setAttribute('data-structured-data', 'dynamic');
      script.setAttribute('data-schema-index', index.toString());
      script.textContent = JSON.stringify(schema);
      document.head.appendChild(script);
    });

    // Cleanup function
    return () => {
      const dynamicSchemas = document.querySelectorAll('script[data-structured-data="dynamic"]');
      dynamicSchemas.forEach(schema => schema.remove());
    };
  }, [newsItems, category, realEstateData, medicalData, medicalType, breadcrumbs]);

  // 이 컴포넌트는 UI를 렌더링하지 않음
  return null;
}