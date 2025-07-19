/**
 * 히어로 섹션 컴포넌트 (메인 배너 영역)
 */

import React from 'react';
import { StatsData, SyncStatus, NewsItem } from '@/types/news';
import WeatherWidget from '../WeatherWidget';

interface HeroSectionProps {
  stats: StatsData | null;
  syncStatus: SyncStatus | null;
  news: NewsItem[];
}

const HeroSection = React.memo(function HeroSection({ stats, syncStatus, news }: HeroSectionProps) {
  return (
    <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-6 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 제목과 날씨 위젯 */}
        <div className="flex justify-between items-start mb-8">
          {/* 제목과 설명 */}
          <div className="flex-1 text-center">
            <h2 className="text-2xl sm:text-4xl font-bold mb-2 sm:mb-4">논현동 생활을 더 편리하게</h2>
            <p className="text-sm sm:text-xl text-blue-100">
              우리 동네 소식, 부동산 정보, 맛집, 육아, 교통, 병원 정보까지 한번에
            </p>
          </div>
          
          {/* 날씨 위젯 */}
          <div className="hidden sm:block">
            <WeatherWidget />
          </div>
        </div>
        
        {/* 통계 정보 */}
        <div className="grid grid-cols-3 gap-3 sm:flex sm:justify-center sm:space-x-12 text-center max-w-md sm:max-w-none mx-auto">
          <div className="bg-white/10 rounded-lg p-3 sm:bg-transparent sm:p-0">
            <div className="text-lg sm:text-3xl font-bold flex items-center justify-center gap-1 sm:gap-2 mb-1">
              <span className="text-xl sm:text-4xl">📊</span>
              <span className="text-base sm:text-3xl">{stats?.totalArticles || news.length}</span>
            </div>
            <div className="text-sm sm:text-base text-blue-100">총 콘텐츠</div>
          </div>
          <div className="bg-white/10 rounded-lg p-3 sm:bg-transparent sm:p-0">
            <div className="text-lg sm:text-3xl font-bold flex items-center justify-center gap-1 sm:gap-2 mb-1">
              <span className="text-xl sm:text-4xl">🏷️</span>
              <span className="text-base sm:text-3xl">{stats?.summary?.totalCategories || syncStatus?.keywords?.length || '10'}</span>
            </div>
            <div className="text-sm sm:text-base text-blue-100">키워드</div>
          </div>
          <div className="bg-white/10 rounded-lg p-3 sm:bg-transparent sm:p-0">
            <div className="text-lg sm:text-3xl font-bold flex items-center justify-center gap-1 sm:gap-2 mb-1">
              <span className="text-xl sm:text-4xl">⚡</span>
              <span className="text-base sm:text-3xl hidden sm:inline">실시간</span>
              <span className="text-sm sm:text-3xl sm:hidden">실시간</span>
            </div>
            <div className="text-sm sm:text-base text-blue-100">자동 업데이트</div>
          </div>
        </div>
        
        {/* 모바일용 날씨 위젯 */}
        <div className="sm:hidden mt-6 flex justify-center">
          <WeatherWidget />
        </div>
      </div>
    </section>
  );
});

export default HeroSection;