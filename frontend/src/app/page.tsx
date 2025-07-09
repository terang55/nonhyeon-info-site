'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
// 필요한 아이콘만 import (현재 사용 중인 아이콘 없음)
import Image from 'next/image';
import Head from 'next/head';
import WeatherWidget from './components/WeatherWidget';
import MedicalWidget from './components/MedicalWidget';
import SEOHead from './components/SEOHead';

interface NewsItem {
  title: string;
  content: string;
  source: string;
  date: string;
  url: string;
  keyword: string;
  content_length: number;
  type?: string; // 'news', 'blog', 'youtube'
  // 유튜브 전용 필드들
  channel?: string;
  views?: string;
  upload_time?: string;
  thumbnail?: string;
}

interface ApiResponse {
  success: boolean;
  data: NewsItem[];
  total: number;
  timestamp: string;
  note?: string;
}

interface SyncStatus {
  lastSync: string | null;
  totalFiles: number;
  keywords: string[];
  files: { [key: string]: string };
  status: 'synced' | 'never_synced';
}

interface StatsData {
  totalArticles: number;
  avgContentLength: number;
  lastUpdated: string;
  summary: {
    newsCount: number;
    blogCount: number;
    totalSources: number;
    totalCategories: number;
  };
}

const categoryIcons: { [key: string]: React.ReactNode } = {
  '뉴스': <span className="text-base">📰</span>,
  '블로그': <span className="text-base">📝</span>,
  '유튜브': <span className="text-base">🎥</span>,
  '병원': <span className="text-base">🏥</span>,
  '약국': <span className="text-base">💊</span>,
  '부동산': <span className="text-base">🏠</span>,
  '학원': <span className="text-base">🎓</span>,
};

const categories = [
  '전체',
  '뉴스',
  '블로그', 
  '유튜브',
  '병원',
  '약국',
  '학원'
];

export default function HomePage() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState('전체');

  const [error, setError] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);
  const [stats, setStats] = useState<StatsData | null>(null);

  const fetchNews = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      if (selectedCategory !== '전체' && selectedCategory !== '병원' && selectedCategory !== '약국' && selectedCategory !== '학원') {
        params.append('category', selectedCategory);
      }
      params.append('limit', '100');

      const response = await fetch(`/api/news?${params.toString()}`, {
        cache: 'no-store', // 항상 최신 데이터 가져오기
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      const result: ApiResponse = await response.json();

      if (result.success) {
        setNews(result.data);
        if (result.note) {
          console.log('API Note:', result.note);
        }
      } else {
        setError('데이터를 불러오는데 실패했습니다.');
      }
    } catch (error) {
      console.error('Error fetching news:', error);
      setError('네트워크 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }, [selectedCategory]);

  useEffect(() => {
    // 병원, 약국, 부동산 카테고리가 아닐 때만 뉴스 로딩
    if (selectedCategory !== '병원' && selectedCategory !== '약국' && selectedCategory !== '부동산' && selectedCategory !== '학원') {
    fetchNews();
    fetchSyncStatus();
    fetchStats();
    } else {
      // 병원, 약국, 부동산 카테고리일 때는 로딩 상태 해제
      setLoading(false);
      setError(null);
      setNews([]);
    }
  }, [fetchNews, selectedCategory]);

  // URL 파라미터에서 카테고리 읽기
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const categoryParam = urlParams.get('category');
    if (categoryParam && categories.includes(categoryParam)) {
      setSelectedCategory(categoryParam);
    }
  }, []);

  // RSS 리디렉션 처리
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const externalUrl = urlParams.get('external');
    
    if (externalUrl) {
      // 3초 후 외부 링크로 리디렉션
      const timer = setTimeout(() => {
        window.open(decodeURIComponent(externalUrl), '_blank', 'noopener,noreferrer');
        // URL에서 파라미터 제거
        window.history.replaceState({}, document.title, window.location.pathname);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, []);

  const fetchSyncStatus = async () => {
    try {
      const response = await fetch('/api/sync', {
        cache: 'no-store', // 항상 최신 동기화 상태 확인
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      const result = await response.json();
      
      if (result.success) {
        setSyncStatus(result.data);
      }
    } catch (error) {
      console.error('Error fetching sync status:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/stats', {
        cache: 'no-store', // 항상 최신 통계 확인
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      const result = await response.json();
      
      if (result.success) {
        setStats(result.data);
      } else {
        console.error('Stats API 오류:', result.error || 'Unknown error');
        // API 오류 시에도 기본값으로 표시하지 않고 실제 데이터 카운트 사용
      }
    } catch (error) {
      console.error('Stats API 호출 실패:', error);
    }
  };

  const formatDate = (dateString: string, item?: NewsItem) => {
    // 유튜브 영상이고 날짜가 없는 경우
    if (item?.type === 'youtube' && (!dateString || dateString.trim() === '')) {
      return '유튜브 영상';
    }
    
    // 블로그 글이고 날짜가 없는 경우
    if (item?.type === 'blog' && (!dateString || dateString.trim() === '')) {
      // 네이버 블로그 URL에서 날짜 추출 시도
      if (item.url && item.url.includes('blog.naver.com')) {
        // 네이버 블로그 포스트 ID는 보통 시간 기반으로 생성되지만
        // 정확한 날짜 추출은 어려우므로 "블로그 글"로 표시
        return '블로그 글';
      }
      return '블로그 글';
    }
    
    if (!dateString || dateString.trim() === '') return '날짜 없음';
    
    try {
      // 한국어 날짜 형식 파싱: "2025.06.25. 오후 3:54"
      const koreanDateMatch = dateString.match(/(\d{4})\.(\d{1,2})\.(\d{1,2})\.\s*(오전|오후)\s*(\d{1,2}):(\d{2})/);
      
      if (koreanDateMatch) {
        const [, year, month, day, ampm, hour, minute] = koreanDateMatch;
        let hour24 = parseInt(hour);
        
        // 오후인 경우 12시간 추가 (단, 12시는 그대로)
        if (ampm === '오후' && hour24 !== 12) {
          hour24 += 12;
        }
        // 오전 12시는 0시로 변환
        if (ampm === '오전' && hour24 === 12) {
          hour24 = 0;
        }
        
        const parsedDate = new Date(
          parseInt(year),
          parseInt(month) - 1, // JavaScript의 월은 0부터 시작
          parseInt(day),
          hour24,
          parseInt(minute)
        );
        
        return parsedDate.toLocaleDateString('ko-KR', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      }
      
      // 표준 ISO 날짜 형식도 시도
      const date = new Date(dateString);
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString('ko-KR', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      }
      
      // 파싱 실패시 원본 반환
      return dateString;
    } catch {
      return dateString;
    }
  };

  const getTypeIcon = (type?: string) => {
    if (type === 'blog') {
      return <span className="text-lg">📝</span>;
    } else if (type === 'youtube') {
      return <span className="text-lg">🎥</span>;
    } else if (type === 'cafe') {
      return <span className="text-lg">☕</span>;
    }
    return <span className="text-lg">📰</span>;
  };

  const getTypeLabel = (type?: string) => {
    if (type === 'blog') {
      return '블로그';
    } else if (type === 'youtube') {
      return '유튜브';
    } else if (type === 'cafe') {
      return '카페';
    }
    return '뉴스';
  };

  const getCategoryColor = (type?: string) => {
    const colors: { [key: string]: string } = {
      'news': 'bg-blue-100 text-blue-800',
      'blog': 'bg-green-100 text-green-800',
      'youtube': 'bg-red-100 text-red-800',
      'cafe': 'bg-yellow-100 text-yellow-800',
    };
    return colors[type || 'news'] || 'bg-gray-100 text-gray-800';
  };

  const generateNewsStructuredData = (): Record<string, unknown> | undefined => {
    if (news.length === 0) return undefined;

    const structuredData = {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "name": "인천논현라이프 - 지역 뉴스 및 정보",
      "description": "인천 남동구 논현동의 최신 뉴스, 블로그, 유튜브 정보를 한눈에 확인하세요.",
      "url": "https://your-domain.com",
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
            }
          }
      }))
      }
  };

    return structuredData;
  };

  return (
    <>
        <SEOHead
          title="인천논현라이프 | 인천논현동 생활정보 플랫폼"
          description="인천시 남동구 논현동 주민을 위한 실시간 뉴스, 지하철 정보, 부동산 정보, 의료 정보를 한눈에 확인하세요."
          keywords={[
            '인천논현동', '인천 논현동', '인천시 남동구 논현동', '남동구 논현동', '논현지구', '에코메트로',
            '수인분당선', '인천논현역', '호구포역', '소래포구역',
            '인천논현동 뉴스', '인천논현동 맛집', '인천논현동 부동산', '인천논현동 병원'
          ]}
          structuredData={generateNewsStructuredData()}
        />
        <Head>
        <title>인천논현라이프 - 인천시 남동구 논현동 생활정보 플랫폼</title>
        <meta name="description" content="인천시 남동구 논현동의 최신 뉴스, 맛집, 카페, 부동산, 육아 정보를 실시간으로 확인하세요. 논현지구, 에코메트로, 소래포구 주변 정보도 함께 제공합니다." />
        <meta name="keywords" content="인천논현동, 인천시 남동구 논현동, 남동구 논현동, 논현지구, 에코메트로, 소래포구, 호구포, 지역정보, 뉴스, 맛집, 카페, 부동산, 육아" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta property="og:title" content="인천논현라이프 - 인천시 남동구 논현동 생활정보 플랫폼" />
        <meta property="og:description" content="인천논현동 주민들을 위한 실시간 지역 정보를 제공합니다. 뉴스, 맛집, 카페, 부동산, 육아 정보를 한눈에 확인하세요." />
        <meta property="og:url" content="https://your-domain.com" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://your-domain.com/og-image.jpg" />
        <link rel="canonical" href="https://your-domain.com" />
        {/* structured data는 SEOHead에서 주입됨 */}
        </Head>
      
      <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <span className="text-2xl sm:text-3xl">🏙️</span>
              <div>
                <h1 className="text-lg sm:text-2xl font-bold text-gray-900">🏠 인천논현라이프</h1>
                <p className="text-xs sm:text-sm text-gray-500">논현동에서의 매일매일</p>
              </div>
            </div>
            <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-600">
              {/* 통합된 업데이트 상태 표시 */}
              <div className="flex items-center space-x-1">
                <span className="text-base">🔄</span>
                <span className="text-xs">
                  {syncStatus && syncStatus.status === 'synced' && syncStatus.lastSync 
                    ? `데이터 업데이트: ${new Date(syncStatus.lastSync).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`
                    : '동기화 대기중'
                  }
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 네비게이션 바 */}
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
                <svg width="20" height="20" fill="currentColor" className="mr-2" viewBox="0 0 24 24"><path d="M3 3h18v18H3V3zm8.5 13.5v-4.5l3.5 4.5h2V7.5h-2v4.5l-3.5-4.5h-2v9h2z"/></svg>
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

      {/* Hero Section */}
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

      {/* Filter */}
      <section className="bg-white py-4 sm:py-6 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center">
            {/* Category Filter */}
            <div className="flex flex-wrap gap-2 sm:gap-3 justify-center">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => {
                    if (category === '학원') {
                      router.push('/academy');
                    } else {
                      setSelectedCategory(category);
                      // URL 파라미터 업데이트
                      const newUrl = category === '전체' ? '/' : `/?category=${encodeURIComponent(category)}`;
                      window.history.pushState({}, '', newUrl);
                    }
                  }}
                  className={`px-4 sm:px-5 py-2.5 sm:py-3 rounded-full text-sm sm:text-base font-medium transition-colors min-h-[44px] min-w-[44px] ${
                    selectedCategory === category
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
                >
                  <div className="flex items-center space-x-1">
                    {category !== '전체' && categoryIcons[category as keyof typeof categoryIcons]}
                    <span>{category}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">


        {/* 병원/약국 정보 위젯 */}
        {selectedCategory === '병원' && <MedicalWidget initialType="hospital" />}
        {selectedCategory === '약국' && <MedicalWidget initialType="pharmacy" />}

        {/* 메인 콘텐츠: 뉴스/블로그/유튜브 */}
        {selectedCategory !== '병원' && selectedCategory !== '약국' && selectedCategory !== '학원' && (
          <div className="flex flex-col gap-8">
            <div className="flex-1">
        {/* 에러 메시지 */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <div className="flex">
              <div className="flex-shrink-0">
                <span className="text-red-400">⚠️</span>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">오류 발생</h3>
                <div className="mt-2 text-sm text-red-700">{error}</div>
              </div>
            </div>
          </div>
        )}
        {loading && (
          <div className="text-center py-8 sm:py-12">
            <div className="inline-block animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-base sm:text-lg text-gray-700 leading-relaxed">데이터를 불러오는 중...</p>
          </div>
        )}
        {!loading && news.length > 0 && (
                <div className="grid gap-3 sm:gap-6 md:grid-cols-3 xl:grid-cols-3">
            {news.map((item, index) => (
              <div
                key={index}
                      className="bg-white rounded-xl shadow-sm border hover:shadow-md transition-all duration-200 overflow-hidden"
              >
                {/* 유튜브 썸네일 */}
                {item.type === 'youtube' && item.thumbnail && (
                  <div className="aspect-video bg-gray-100 rounded-t-lg overflow-hidden relative">
                    <Image 
                      src={item.thumbnail} 
                      alt={item.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  </div>
                )}
                      <div className="p-3 sm:p-6">
                  {/* 헤더 */}
                  <div className="flex items-start justify-between mb-2">
                          <span className={`inline-flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-medium min-h-[28px] sm:min-h-[36px] ${
                      item.type === 'youtube' ? 'bg-red-100 text-red-800' :
                      item.type === 'blog' ? 'bg-green-100 text-green-800' :
                      getCategoryColor(item.type)
                    }`}>
                      {getTypeIcon(item.type)} {getTypeLabel(item.type)}
                    </span>
                          <span className="text-xs sm:text-sm text-gray-600 flex-shrink-0 ml-2">
                            {item.type === 'youtube' ? item.views : ''}
                    </span>
                  </div>
                        <h3 className="text-sm sm:text-lg font-semibold text-gray-900 mb-2 line-clamp-2 leading-tight">
                    <a 
                      href={item.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                            className="hover:text-blue-600 transition-colors touch-manipulation"
                    >
                      {item.title}
                    </a>
                  </h3>
                  {item.type !== 'youtube' && (
                          <p className="text-gray-700 text-xs sm:text-sm mb-2 sm:mb-3 line-clamp-2 leading-tight">
                      {item.content}
                    </p>
                  )}
                        <div className="flex items-center justify-between text-xs sm:text-sm pt-2 border-t border-gray-100">
                          <span className="font-medium text-gray-900 truncate mr-2 flex items-center gap-1 flex-1 min-w-0">
                            <span className="text-gray-500 text-xs">🏢</span>
                            <span className="min-w-0 truncate text-xs sm:text-sm">{item.type === 'youtube' ? item.channel : item.source}</span>
                    </span>
                          <span className="text-gray-600 text-xs flex-shrink-0 flex items-center gap-1">
                            <span className="text-gray-500">🕒</span>
                      {item.type === 'youtube' ? 
                              (item.upload_time && item.upload_time.trim() !== '' && !item.upload_time.includes('불명') ? item.upload_time : '') : 
                        formatDate(item.date, item)
                      }
                    </span>
                  </div>
                        {item.keyword && (
                          <div className={`mt-2 pt-2 border-t`}>
                            <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium min-h-[24px] ${
                              item.type === 'youtube' ? 'bg-red-100 text-red-700' :
                              item.type === 'blog' ? 'bg-green-100 text-green-700' :
                              'bg-blue-100 text-blue-700'
                            }`}>
                        #{item.keyword}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        {!loading && news.length === 0 && !error && (
          <div className="text-center py-8 sm:py-12">
            <div className="text-4xl sm:text-6xl mb-3 sm:mb-4">🤔</div>
            <h3 className="text-lg sm:text-xl font-medium text-gray-900 mb-2 leading-relaxed">
              검색 결과가 없습니다
            </h3>
            <p className="text-base sm:text-lg text-gray-700 leading-relaxed">
              다른 키워드나 카테고리로 검색해보세요.
            </p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 sm:py-12 mt-8 sm:mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 mb-6 sm:mb-8">
            {/* 브랜드 정보 */}
            <div className="flex flex-col items-center md:items-start">
              <div className="flex items-center space-x-2 sm:space-x-3 mb-3 sm:mb-4">
                <span className="text-2xl sm:text-3xl">🏙️</span>
                <div>
                  <div className="text-lg sm:text-xl font-bold">인천논현라이프</div>
                  <div className="text-sm text-gray-400">인천시 남동구 논현동 지역 정보</div>
                </div>
              </div>
              <p className="text-sm text-gray-300 text-center md:text-left max-w-sm">
                인천논현동 주민들을 위한 실시간 지역 정보를 제공합니다. 뉴스, 맛집, 카페, 부동산, 육아 정보를 한눈에 확인하세요.
              </p>
            </div>

            {/* 주요 지역 */}
            <div className="text-center md:text-left">
              <h3 className="text-sm sm:text-base font-semibold mb-3 sm:mb-4">주요 지역</h3>
              <ul className="space-y-1 sm:space-y-2 text-sm text-gray-300">
                <li>📍 인천논현동</li>
                <li>🚇 에코메트로</li>
                <li>🦐 소래포구</li>
                <li>⚓ 호구포</li>
                <li>🏗️ 논현지구</li>
              </ul>
            </div>

            {/* 비즈니스 문의 */}
            <div className="text-center md:text-left">
              <h3 className="text-sm sm:text-base font-semibold mb-3 sm:mb-4">💼사이트 문의</h3>
              <div className="space-y-2 text-sm text-gray-300">
                <div className="flex items-center justify-center md:justify-start space-x-2">
                  <span className="text-base">📧</span>
                  <a 
                    href="mailto:rainbowcr55@gmail.com" 
                    className="hover:text-white transition-colors"
                  >
                    rainbowcr55@gmail.com
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* 하단 구분선 및 저작권 */}
          <div className="border-t border-gray-700 pt-6 sm:pt-8">
            <div className="flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0">
              <div className="text-xs sm:text-sm text-gray-400">
                © 2025 인천논현라이프. 모든 권리 보유.
              </div>
              <div className="flex items-center space-x-4 text-xs sm:text-sm">
                <a 
                  href="/privacy" 
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  개인정보처리방침
                </a>
                <span className="text-gray-600">|</span>
                <a 
                  href="/terms" 
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  이용약관
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
    </>
  );
}
