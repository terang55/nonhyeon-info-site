'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { BASE_URL } from '@/lib/siteConfig';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  noindex?: boolean;
  structuredData?: Record<string, unknown> | Record<string, unknown>[];
}

export default function SEOHead({
  title,
  description,
  keywords = [],
  image,
  noindex = false,
  structuredData
}: SEOHeadProps) {
  const pathname = usePathname();
  
  useEffect(() => {
    // 페이지 방문 시 구글 애널리틱스 이벤트 전송
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('config', 'G-SSEDR2CED7', {
        page_title: title || document.title,
        page_location: window.location.href,
        page_path: pathname,
        custom_map: {
          dimension1: 'page_category',
          dimension2: 'user_location'
        }
      });
      
      // 페이지뷰 이벤트
      window.gtag('event', 'page_view', {
        page_title: title || document.title,
        page_location: window.location.href,
        page_path: pathname,
        send_to: 'G-SSEDR2CED7'
      });
    }
  }, [pathname, title]);
  
  useEffect(() => {
    // 동적 메타 태그 업데이트
    if (title) {
      document.title = title;
    }
    
    if (description) {
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute('content', description);
      }
    }
    
    if (keywords.length > 0) {
      const metaKeywords = document.querySelector('meta[name="keywords"]');
      if (metaKeywords) {
        metaKeywords.setAttribute('content', keywords.join(', '));
      }
    }

    // robots 메타 태그 업데이트 (noindex 처리)
    const metaRobots = document.querySelector('meta[name="robots"]') || (() => {
      const tag = document.createElement('meta');
      tag.setAttribute('name', 'robots');
      document.head.appendChild(tag);
      return tag;
    })();

    if (noindex) {
      metaRobots.setAttribute('content', 'noindex, nofollow');
    } else {
      metaRobots.setAttribute('content', 'index, follow');
    }

    // Open Graph 메타 태그 업데이트
    if (title) {
      const ogTitle = document.querySelector('meta[property="og:title"]');
      if (ogTitle) {
        ogTitle.setAttribute('content', title);
      }
    }
    
    if (description) {
      const ogDescription = document.querySelector('meta[property="og:description"]');
      if (ogDescription) {
        ogDescription.setAttribute('content', description);
      }
    }
    
    if (image) {
      const ogImage = document.querySelector('meta[property="og:image"]');
      if (ogImage) {
        ogImage.setAttribute('content', image);
      }
    }
    
    // 현재 URL 업데이트
    const ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl) {
      ogUrl.setAttribute('content', `${BASE_URL}${pathname}`);
    }
    
    // 정규 URL 업데이트
    const canonicalLink = document.querySelector('link[rel="canonical"]');
    if (canonicalLink) {
      canonicalLink.setAttribute('href', `${BASE_URL}${pathname}`);
    }
    
  }, [title, description, keywords, image, pathname, noindex]);
  
  useEffect(() => {
    // 구조화된 데이터 동적 추가
    if (structuredData) {
      const existingScript = document.querySelector('#dynamic-structured-data');
      if (existingScript) {
        existingScript.remove();
      }
      
      const script = document.createElement('script');
      script.id = 'dynamic-structured-data';
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify(structuredData);
      document.head.appendChild(script);
    }
  }, [structuredData]);
  
  useEffect(() => {
    // 네이버 서치어드바이저 페이지 등록
    if (typeof window !== 'undefined' && window.location.hostname === 'nonhyeon.life') {
      // 페이지 방문 시 네이버에 색인 요청 (실제 구현 시 API 키 필요)
      console.log('📊 네이버 서치어드바이저 페이지 등록:', window.location.href);
    }
  }, [pathname]);
  
  return null; // 이 컴포넌트는 사이드 이펙트만 처리
}

// gtag 타입은 analytics.ts에서 정의됨 