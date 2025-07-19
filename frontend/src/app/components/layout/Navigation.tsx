/**
 * 네비게이션 바 컴포넌트
 */

import React from 'react';

export default function Navigation() {
  return (
    <section className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-center py-3 sm:py-4 gap-2 sm:gap-6">
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 w-full sm:w-auto">
            <a 
              href="/realestate" 
              className="flex items-center space-x-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors min-h-[44px] w-full sm:w-auto justify-center"
            >
              <span className="text-lg">🏢</span>
              <span className="text-sm font-medium">부동산 정보</span>
            </a>
            <a 
              href="/subway" 
              className="flex items-center space-x-2 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors min-h-[44px] w-full sm:w-auto justify-center"
            >
              <span className="text-lg">🚇</span>
              <span className="text-sm font-medium">실시간 교통</span>
            </a>
            {/* 네이버카페 논총연 배너 */}
            <a
              href="https://cafe.naver.com/17nongogaero"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 px-4 py-2.5 bg-[#03C75A] text-white rounded-lg hover:bg-[#02b152] transition-colors min-h-[44px] w-full sm:w-auto justify-center font-semibold"
              aria-label="네이버카페 논총연 바로가기"
            >
              <svg width="20" height="20" fill="currentColor" className="mr-2" viewBox="0 0 24 24">
                <path d="M3 3h18v18H3V3zm8.5 13.5v-4.5l3.5 4.5h2V7.5h-2v4.5l-3.5-4.5h-2v9h2z"/>
              </svg>
              <span className="text-sm font-medium">네이버카페 논총연</span>
            </a>
          </div>
          <div className="text-sm sm:text-base text-gray-700 text-center leading-relaxed">
            <span className="block sm:hidden">부동산 실거래가 · 지하철 실시간 정보</span>
            <span className="hidden sm:block">논현동 실거래가 · 호구포역 · 인천논현역 · 소래포구역 실시간 정보</span>
          </div>
        </div>
      </div>
    </section>
  );
}