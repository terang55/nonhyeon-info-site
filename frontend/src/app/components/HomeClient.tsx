'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useNews } from '@/hooks/useNews';
import { useSyncStatus } from '@/hooks/useSyncStatus';
import { useStats } from '@/hooks/useStats';
import { useCategory } from '@/hooks/useCategory';
import { useUrlParams } from '@/hooks/useUrlParams';
import { useHaptic } from '@/utils/haptics';

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
  const { selectedCategory, handleCategoryChange: originalHandleCategoryChange } = useCategory();
  const { news, loading, loadingMore, error, hasMore, fetchNews, loadMore, setNews, setError } = useNews(selectedCategory);
  const { syncStatus, fetchSyncStatus } = useSyncStatus();
  const { stats, fetchStats } = useStats();
  const { haptic } = useHaptic();
  
  // 햅틱 피드백이 포함된 카테고리 변경 핸들러
  const handleCategoryChange = (category: string) => {
    haptic('light'); // 카테고리 변경 시 가벼운 진동
    originalHandleCategoryChange(category);
  };
  
  // URL 파라미터 처리
  useUrlParams();

  // 풀투리프레시 상태
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isPulling, setIsPulling] = useState(false);
  const touchStartY = useRef(0);
  const lastTouchY = useRef(0);
  const pullThreshold = 80;

  // 스티키 카테고리 바 상태
  const [isCategorySticky, setIsCategorySticky] = useState(false);
  const categoryRef = useRef<HTMLDivElement>(null);
  const stickyThreshold = 200;

  // 무한 스크롤 상태
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // 풀투리프레시 핸들러
  const handlePullToRefresh = async () => {
    if (isRefreshing) return;
    
    haptic('medium'); // 새로고침 시작 시 진동
    setIsRefreshing(true);
    try {
      await Promise.all([
        fetchNews(),
        fetchSyncStatus(),
        fetchStats()
      ]);
      haptic('success'); // 새로고침 성공 시 진동
    } catch (error) {
      console.error('새로고침 실패:', error);
      haptic('error'); // 새로고침 실패 시 진동
    } finally {
      setIsRefreshing(false);
      setPullDistance(0);
      setIsPulling(false);
    }
  };

  // 터치 이벤트 핸들러
  const handleTouchStart = (e: React.TouchEvent) => {
    if (window.scrollY > 0) return;
    touchStartY.current = e.touches[0].clientY;
    lastTouchY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (window.scrollY > 0 || isRefreshing) return;
    
    const currentY = e.touches[0].clientY;
    const deltaY = currentY - touchStartY.current;
    
    if (deltaY > 0) {
      e.preventDefault();
      setIsPulling(true);
      const distance = Math.min(deltaY * 0.4, pullThreshold + 20);
      
      // 임계점 도달 시 가벼운 햅틱 피드백
      if (distance >= pullThreshold && pullDistance < pullThreshold) {
        haptic('light');
      }
      
      setPullDistance(distance);
    }
    lastTouchY.current = currentY;
  };

  const handleTouchEnd = () => {
    if (isPulling && pullDistance >= pullThreshold) {
      handlePullToRefresh();
    } else {
      setPullDistance(0);
      setIsPulling(false);
    }
  };

  // Breadcrumb 데이터 생성
  const breadcrumbs = [
    { name: '홈', url: 'https://nonhyeon.life' },
    ...(selectedCategory !== '전체' ? [{ name: selectedCategory, url: `https://nonhyeon.life/?category=${selectedCategory}` }] : [])
  ];

  // 스크롤 이벤트 리스너 (스티키 카테고리 바)
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setIsCategorySticky(scrollY > stickyThreshold);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [stickyThreshold]);

  // 무한 스크롤 Intersection Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (target.isIntersecting && hasMore && !loadingMore && !loading) {
          loadMore();
        }
      },
      { 
        threshold: 0.1,
        rootMargin: '100px' // 100px 전에 미리 로드
      }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => {
      if (loadMoreRef.current) {
        observer.unobserve(loadMoreRef.current);
      }
    };
  }, [hasMore, loadingMore, loading, loadMore]);

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
    <div 
      className="min-h-screen bg-gray-50"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* 구조화된 데이터 제공 */}
      <StructuredDataProvider
        newsItems={news}
        category={selectedCategory}
        breadcrumbs={breadcrumbs}
      />
      
      {/* 풀투리프레시 인디케이터 */}
      <div 
        className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-center bg-white shadow-sm transition-transform duration-300 ${
          isPulling ? 'translate-y-0' : '-translate-y-full'
        }`}
        style={{ 
          transform: `translateY(${Math.max(pullDistance - 60, -60)}px)`,
          height: '60px'
        }}
      >
        <div className="flex items-center gap-2 text-blue-600">
          <div 
            className={`w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full transition-transform duration-300 ${
              isRefreshing ? 'animate-spin' : ''
            } ${
              pullDistance >= pullThreshold ? 'rotate-180' : ''
            }`}
          />
          <span className="text-sm font-medium">
            {isRefreshing ? '새로고침 중...' : pullDistance >= pullThreshold ? '놓으면 새로고침' : '아래로 당겨서 새로고침'}
          </span>
        </div>
      </div>
      
      {/* Header */}
      <Header syncStatus={syncStatus} />

      {/* Navigation */}
      <Navigation />

      {/* Hero Section */}
      <ErrorBoundary section="히어로">
        <HeroSection stats={stats} syncStatus={syncStatus} news={news} />
      </ErrorBoundary>

      {/* Category Filter - 원본 위치 */}
      <div ref={categoryRef}>
        <ErrorBoundary section="카테고리 필터">
          <CategoryFilter 
            selectedCategory={selectedCategory} 
            onCategoryChange={handleCategoryChange} 
          />
        </ErrorBoundary>
      </div>

      {/* Sticky Category Filter */}
      <div 
        className={`fixed top-16 left-0 right-0 z-40 bg-white shadow-lg transition-transform duration-300 ${
          isCategorySticky ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        <ErrorBoundary section="스티키 카테고리 필터">
          <CategoryFilter 
            selectedCategory={selectedCategory} 
            onCategoryChange={handleCategoryChange} 
          />
        </ErrorBoundary>
      </div>

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
              
              {/* 무한 스크롤 로더 */}
              {!loading && news.length > 0 && (
                <div ref={loadMoreRef} className="flex justify-center py-8">
                  {loadingMore ? (
                    <div className="flex items-center gap-2 text-blue-600">
                      <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                      <span className="text-sm">더 많은 뉴스 로딩 중...</span>
                    </div>
                  ) : hasMore ? (
                    <div className="text-gray-500 text-sm">
                      스크롤하여 더 많은 뉴스 보기
                    </div>
                  ) : (
                    <div className="text-gray-400 text-sm">
                      모든 뉴스를 확인했습니다
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </ErrorBoundary>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
} 