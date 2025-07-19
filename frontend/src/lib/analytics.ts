/**
 * Core Web Vitals 모니터링 및 분석 유틸리티
 */

import { onCLS, onINP, onFCP, onLCP, onTTFB, Metric } from 'web-vitals';

// Web Vitals 메트릭 타입 정의
export interface WebVitalsMetric {
  id: string;
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  navigationType: string;
  timestamp: number;
  url: string;
  userAgent: string;
}

// 성능 임계값 정의 (Google 기준)
const THRESHOLDS = {
  LCP: { good: 2500, poor: 4000 },
  INP: { good: 200, poor: 500 }, // FID 대신 INP 사용
  CLS: { good: 0.1, poor: 0.25 },
  FCP: { good: 1800, poor: 3000 },
  TTFB: { good: 800, poor: 1800 }
};

/**
 * 메트릭 값을 기준으로 등급 계산
 */
function getRating(name: string, value: number): 'good' | 'needs-improvement' | 'poor' {
  const threshold = THRESHOLDS[name as keyof typeof THRESHOLDS];
  if (!threshold) return 'good';
  
  if (value <= threshold.good) return 'good';
  if (value <= threshold.poor) return 'needs-improvement';
  return 'poor';
}

/**
 * Web Vitals 메트릭을 콘솔에 로깅
 */
function logMetric(metric: Metric) {
  const webVitalMetric: WebVitalsMetric = {
    id: metric.id,
    name: metric.name,
    value: metric.value,
    rating: getRating(metric.name, metric.value),
    delta: metric.delta,
    navigationType: (metric as Metric & { navigationType?: string }).navigationType || 'unknown',
    timestamp: Date.now(),
    url: window.location.href,
    userAgent: navigator.userAgent
  };

  // 개발 환경에서는 콘솔 로깅
  if (process.env.NODE_ENV === 'development') {
    console.group(`🔍 Core Web Vitals: ${metric.name}`);
    console.log(`값: ${metric.value}${metric.name === 'CLS' ? '' : 'ms'}`);
    console.log(`등급: ${webVitalMetric.rating}`);
    console.log(`델타: ${metric.delta}`);
    console.log(`URL: ${webVitalMetric.url}`);
    console.groupEnd();
  }

  // 프로덕션에서는 분석 서비스로 전송 (추후 구현)
  if (process.env.NODE_ENV === 'production') {
    sendToAnalytics(webVitalMetric);
  }
}

/**
 * 분석 서비스로 메트릭 전송 (추후 Google Analytics 연동)
 */
function sendToAnalytics(metric: WebVitalsMetric) {
  // Google Analytics 4 이벤트 전송
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', metric.name, {
      event_category: 'Web Vitals',
      value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
      metric_rating: metric.rating,
      custom_map: {
        metric_id: metric.id,
        metric_delta: metric.delta
      }
    });
  }

  // 커스텀 API로 전송 (선택사항)
  if (process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT) {
    fetch(process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(metric),
    }).catch(console.error);
  }
}

/**
 * Core Web Vitals 모니터링 초기화
 * 클라이언트 컴포넌트에서 호출
 */
export function initWebVitals() {
  if (typeof window === 'undefined') return;

  try {
    onCLS(logMetric);
    onINP(logMetric);
    onFCP(logMetric);
    onLCP(logMetric);
    onTTFB(logMetric);
  } catch (error) {
    console.error('Web Vitals 초기화 실패:', error);
  }
}

/**
 * 페이지별 성능 요약 생성
 */
export function generatePerformanceReport() {
  if (typeof window === 'undefined') return null;

  const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
  const paint = performance.getEntriesByType('paint');

  return {
    page: window.location.pathname,
    timestamp: Date.now(),
    navigation: {
      domContentLoaded: Math.round(navigation.domContentLoadedEventEnd - navigation.navigationStart),
      loadComplete: Math.round(navigation.loadEventEnd - navigation.navigationStart),
      networkLatency: Math.round(navigation.responseStart - navigation.requestStart),
      serverResponseTime: Math.round(navigation.responseEnd - navigation.requestStart),
    },
    paint: {
      firstPaint: paint.find(p => p.name === 'first-paint')?.startTime || 0,
      firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0,
    },
    memory: (performance as Performance & { memory?: { usedJSMemory: number; totalJSMemory: number } }).memory ? {
      usedJSMemory: Math.round((performance as Performance & { memory: { usedJSMemory: number; totalJSMemory: number } }).memory.usedJSMemory / 1048576), // MB
      totalJSMemory: Math.round((performance as Performance & { memory: { usedJSMemory: number; totalJSMemory: number } }).memory.totalJSMemory / 1048576), // MB
    } : null
  };
}

/**
 * 성능 문제 감지 및 알림
 */
export function detectPerformanceIssues(metric: WebVitalsMetric) {
  const issues: string[] = [];

  switch (metric.name) {
    case 'LCP':
      if (metric.rating === 'poor') {
        issues.push('Largest Contentful Paint가 느립니다. 이미지 최적화나 리소스 로딩을 개선하세요.');
      }
      break;
    case 'INP':
      if (metric.rating === 'poor') {
        issues.push('Interaction to Next Paint가 높습니다. JavaScript 실행 시간을 줄이세요.');
      }
      break;
    case 'CLS':
      if (metric.rating === 'poor') {
        issues.push('Cumulative Layout Shift가 높습니다. 레이아웃 변경을 최소화하세요.');
      }
      break;
  }

  return issues;
}

// Google Analytics gtag 타입 확장
declare global {
  interface Window {
    gtag?: (
      command: 'config' | 'event',
      targetId: string,
      config?: Record<string, unknown>
    ) => void;
  }
}