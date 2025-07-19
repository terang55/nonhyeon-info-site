/**
 * Core Web Vitals 모니터링 컴포넌트
 * 클라이언트에서만 실행되며 성능 지표를 수집합니다.
 */

'use client';

import { useEffect } from 'react';
import { initWebVitals, generatePerformanceReport } from '@/lib/analytics';

export default function WebVitalsMonitor() {
  useEffect(() => {
    // 페이지 로드 시 Web Vitals 모니터링 시작
    initWebVitals();

    // 페이지가 완전히 로드된 후 성능 보고서 생성
    const timer = setTimeout(() => {
      const report = generatePerformanceReport();
      if (report && process.env.NODE_ENV === 'development') {
        console.group('📊 페이지 성능 보고서');
        console.log('페이지:', report.page);
        console.log('DOM 로딩:', `${report.navigation.domContentLoaded}ms`);
        console.log('전체 로딩:', `${report.navigation.loadComplete}ms`);
        console.log('서버 응답:', `${report.navigation.serverResponseTime}ms`);
        console.log('First Paint:', `${Math.round(report.paint.firstPaint)}ms`);
        console.log('First Contentful Paint:', `${Math.round(report.paint.firstContentfulPaint)}ms`);
        if (report.memory) {
          console.log('JS 메모리 사용량:', `${report.memory.usedJSMemory}MB`);
        }
        console.groupEnd();
      }
    }, 3000);

    // Cleanup
    return () => clearTimeout(timer);
  }, []);

  // 이 컴포넌트는 UI를 렌더링하지 않음 (모니터링 전용)
  return null;
}