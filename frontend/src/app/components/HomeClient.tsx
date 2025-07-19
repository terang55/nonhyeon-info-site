'use client';

import React, { useEffect } from 'react';
import { useNews } from '@/hooks/useNews';
import { useSyncStatus } from '@/hooks/useSyncStatus';
import { useStats } from '@/hooks/useStats';
import { useCategory } from '@/hooks/useCategory';
import { useUrlParams } from '@/hooks/useUrlParams';

// Layout Components
import Header from './layout/Header';
import Navigation from './layout/Navigation';
import HeroSection from './layout/HeroSection';
import CategoryFilter from './layout/CategoryFilter';

// News Components
import NewsContent from './news/NewsContent';

// Widget Components (동적 임포트)
import DynamicMedicalWidget from './DynamicMedicalWidget';

// Footer Component
import Footer from './Footer';

// Error Boundary
import ErrorBoundary from './ErrorBoundary';

// Structured Data
import StructuredDataProvider from './StructuredDataProvider';

export default function HomeClient() {
  // 커스텀 훅들
  const { selectedCategory, handleCategoryChange } = useCategory();
  const { news, loading, error, fetchNews, setNews, setError } = useNews(selectedCategory);
  const { syncStatus, fetchSyncStatus } = useSyncStatus();
  const { stats, fetchStats } = useStats();
  
  // URL 파라미터 처리
  useUrlParams();

  // Breadcrumb 데이터 생성
  const breadcrumbs = [
    { name: '홈', url: 'https://nonhyeon.life' },
    ...(selectedCategory !== '전체' ? [{ name: selectedCategory, url: `https://nonhyeon.life/?category=${selectedCategory}` }] : [])
  ];

  // 데이터 페칭
  useEffect(() => {
    // 병원, 약국, 부동산 카테고리가 아닐 때만 뉴스 로딩
    if (selectedCategory !== '병원' && selectedCategory !== '약국' && selectedCategory !== '부동산' && selectedCategory !== '학원') {
      fetchNews();
      fetchSyncStatus();
      fetchStats();
    } else {
      // 병원, 약국, 부동산 카테고리일 때는 로딩 상태 해제
      setError(null);
      setNews([]);
    }
  }, [selectedCategory, fetchNews, fetchSyncStatus, fetchStats, setNews, setError]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 구조화된 데이터 제공 */}
      <StructuredDataProvider
        newsItems={news}
        category={selectedCategory}
        breadcrumbs={breadcrumbs}
      />
      
      {/* Header */}
      <Header syncStatus={syncStatus} />

      {/* Navigation */}
      <Navigation />

      {/* Hero Section */}
      <ErrorBoundary section="히어로">
        <HeroSection stats={stats} syncStatus={syncStatus} news={news} />
      </ErrorBoundary>

      {/* Category Filter */}
      <ErrorBoundary section="카테고리 필터">
        <CategoryFilter 
          selectedCategory={selectedCategory} 
          onCategoryChange={handleCategoryChange} 
        />
      </ErrorBoundary>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* 병원/약국 정보 위젯 */}
        <ErrorBoundary section="의료정보">
          {selectedCategory === '병원' && <DynamicMedicalWidget initialType="hospital" />}
          {selectedCategory === '약국' && <DynamicMedicalWidget initialType="pharmacy" />}
        </ErrorBoundary>

        {/* 메인 콘텐츠: 뉴스/블로그/유튜브 */}
        <ErrorBoundary section="뉴스">
          {selectedCategory !== '병원' && selectedCategory !== '약국' && selectedCategory !== '학원' && (
            <div className="flex flex-col gap-8">
              <NewsContent news={news} loading={loading} error={error} />
            </div>
          )}
        </ErrorBoundary>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
} 