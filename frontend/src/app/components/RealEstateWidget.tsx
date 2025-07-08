'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Loader2, RefreshCw, Sparkles, Info } from 'lucide-react';

interface Deal {
  apartment_name: string;
  area: string;
  floor: string;
  price: string;
  price_numeric: number;
  deal_date: string;
  build_year: string;
  location: string;
  price_per_pyeong: string;
  uniqueId?: string;
  isNew?: boolean;
}

interface Statistics {
  total_deals: number;
  avg_price: string;
  max_price: string;
  min_price: string;
  period: string;
}

interface ApartmentStat {
  name: string;
  count: number;
  avg_price: string;
  avg_price_numeric: number;
  newCount?: number;
}

interface RealEstateData {
  deals: Deal[];
  statistics: Statistics;
  apartment_stats: ApartmentStat[];
}

interface RealEstateResponse {
  success: boolean;
  data: RealEstateData;
  newTransactions?: Deal[];
  newCount?: number;
  location: string;
  timestamp: string;
  comparisonTime?: string;
}

// localStorage 키 상수
const STORAGE_KEY = 'nonhyeon_realestate_data';
const STORAGE_TIMESTAMP_KEY = 'nonhyeon_realestate_timestamp';
const STORAGE_EXPIRY_HOURS = 24;

// 고유 ID 생성 함수 (기존 데이터 구조에 맞게 조정)
function generateUniqueId(deal: Deal): string {
  return `${deal.apartment_name}-${deal.area}-${deal.floor}-${deal.deal_date}-${deal.price_numeric}`;
}

export default function RealEstateWidget() {
  const [data, setData] = useState<RealEstateData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAllDeals, setShowAllDeals] = useState(false);
  const [expandedApartment, setExpandedApartment] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [highlight, setHighlight] = useState<string | null>(null);
  const [showNewOnly, setShowNewOnly] = useState(false);
  const [newTransactions, setNewTransactions] = useState<Deal[]>([]);
  const [lastUpdateTime, setLastUpdateTime] = useState<string | null>(null);
  const [hasStoredData, setHasStoredData] = useState(false);
  const [isComparing, setIsComparing] = useState(false);
  const [celebrationMessage, setCelebrationMessage] = useState<string | null>(null);
  
  const apartmentRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // localStorage에서 데이터 읽기
  const getStoredData = useCallback((): { data: Deal[] | null; timestamp: string | null } => {
    try {
      const storedData = localStorage.getItem(STORAGE_KEY);
      const storedTimestamp = localStorage.getItem(STORAGE_TIMESTAMP_KEY);
      
      if (!storedData || !storedTimestamp) {
        return { data: null, timestamp: null };
      }
      
      // 24시간 만료 체크
      const timestamp = new Date(storedTimestamp);
      const now = new Date();
      const hoursDiff = (now.getTime() - timestamp.getTime()) / (1000 * 60 * 60);
      
      if (hoursDiff > STORAGE_EXPIRY_HOURS) {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(STORAGE_TIMESTAMP_KEY);
        return { data: null, timestamp: null };
      }
      
      return {
        data: JSON.parse(storedData),
        timestamp: storedTimestamp
      };
    } catch (error) {
      console.error('localStorage 읽기 오류:', error);
      return { data: null, timestamp: null };
    }
  }, []);

  // localStorage에 데이터 저장
  const saveDataToStorage = useCallback((deals: Deal[]) => {
    try {
      const timestamp = new Date().toISOString();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(deals));
      localStorage.setItem(STORAGE_TIMESTAMP_KEY, timestamp);
      setLastUpdateTime(timestamp);
    } catch (error) {
      console.error('localStorage 저장 오류:', error);
    }
  }, []);

  // 시간 경과 표시
  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffHours = (now.getTime() - time.getTime()) / (1000 * 60 * 60);
    
    if (diffHours < 1) {
      return '방금 전';
    } else if (diffHours < 24) {
      return `${Math.floor(diffHours)}시간 전`;
    } else {
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays}일 전`;
    }
  };

  useEffect(() => {
    const { data: storedData, timestamp } = getStoredData();
    
    if (storedData && timestamp) {
      setHasStoredData(true);
      setLastUpdateTime(timestamp);
      console.log('📦 저장된 부동산 데이터 확인:', storedData.length, '건');
    }
    
    fetchRealEstateData();
  }, [getStoredData]);

  const fetchRealEstateData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/realestate?months=3', {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result: RealEstateResponse = await response.json();
      console.log('🔍 API 응답:', result);
      
      if (result.success && result.data) {
        // 안전한 데이터 처리
        const dealsData = result.data.deals || [];
        const statisticsData = result.data.statistics || {
          total_deals: 0,
          avg_price: '0원',
          max_price: '0원',
          min_price: '0원',
          period: '데이터 없음'
        };
        const apartmentStatsData = result.data.apartment_stats || [];
        
        // 고유 ID 추가
        const dealsWithIds = dealsData.map(deal => ({
          ...deal,
          uniqueId: generateUniqueId(deal)
        }));
        
        setData({
          deals: dealsWithIds,
          statistics: statisticsData,
          apartment_stats: apartmentStatsData
        });
        
        // 데이터를 localStorage에 저장
        saveDataToStorage(dealsWithIds);
        
        console.log('✅ 부동산 데이터 로드 및 저장 완료:', dealsWithIds.length, '건');
      } else {
        setError('실거래가 정보를 불러올 수 없습니다.');
      }
    } catch (error) {
      console.error('실거래가 데이터 로딩 오류:', error);
      setError('데이터 로딩 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }, [saveDataToStorage]);

  // 신규 거래 비교
  const compareWithPreviousData = useCallback(async () => {
    try {
      setIsComparing(true);
      setError(null);

      const { data: previousData } = getStoredData();
      
      if (!previousData || previousData.length === 0) {
        setError('비교할 이전 데이터가 없습니다. 먼저 "🔄 새로고침"을 클릭해주세요.');
        return;
      }

      // 이전 데이터의 고유 ID Set 생성
      const previousIds = new Set(previousData.map(generateUniqueId));
      
      // 현재 데이터에서 신규 거래 찾기
      const currentDeals = data?.deals || [];
      const newDeals = currentDeals.filter(deal => {
        const currentId = generateUniqueId(deal);
        return !previousIds.has(currentId);
      }).map(deal => ({
        ...deal,
        isNew: true
      }));

      // 전체 데이터에 신규 표시 추가
      const dealsWithNewFlag = currentDeals.map(deal => ({
        ...deal,
        isNew: newDeals.some(newDeal => generateUniqueId(newDeal) === generateUniqueId(deal))
      }));

      // 아파트별 신규 거래 수 계산
      const apartmentStats = (data?.apartment_stats || []).map(stat => {
        const newCount = newDeals.filter(deal => deal.apartment_name === stat.name).length;
        return {
          ...stat,
          newCount
        };
      });
      
      setData(prev => prev ? {
        ...prev,
        deals: dealsWithNewFlag,
        apartment_stats: apartmentStats
      } : null);
      
      setNewTransactions(newDeals);
      
      const newCount = newDeals.length;
      
      if (newCount > 0) {
        setShowNewOnly(true);
        setCelebrationMessage(`🎉 새로운 거래 ${newCount}건을 발견했습니다!`);
        
        // 새 데이터를 localStorage에 저장
        saveDataToStorage(dealsWithNewFlag);
        
        // 축하 메시지 3초 후 제거
        setTimeout(() => setCelebrationMessage(null), 3000);
      } else {
        setCelebrationMessage('💡 신규 거래가 없습니다. 모든 데이터가 최신 상태입니다.');
        setTimeout(() => setCelebrationMessage(null), 3000);
      }
      
      console.log('✅ 신규 거래 비교 완료:', newCount, '건 발견');
      
    } catch (error) {
      console.error('신규 거래 비교 오류:', error);
      setError('신규 거래 비교 중 오류가 발생했습니다.');
    } finally {
      setIsComparing(false);
    }
  }, [data, getStoredData, saveDataToStorage]);

  // 검색어가 단지명과 정확히 일치하면 해당 카드로 스크롤 & 강조
  useEffect(() => {
    const target = searchTerm.trim();
    if (target && apartmentRefs.current[target]) {
      apartmentRefs.current[target]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setExpandedApartment(target);
      setHighlight(target);
      const timer = setTimeout(() => setHighlight(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [searchTerm]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center text-red-600">
          <p className="text-lg font-semibold mb-2">🏠 실거래가 정보</p>
          <p className="text-sm">{error}</p>
          <button 
            onClick={fetchRealEstateData}
            className="mt-3 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center text-gray-600">
          <p className="text-lg font-semibold mb-2">🏠 실거래가 정보</p>
          <p className="text-sm">데이터를 불러오는 중입니다...</p>
        </div>
      </div>
    );
  }

  // 아파트 이름 배열 (중복 제거) - 안전한 처리
  const apartmentNames = Array.from(new Set(
    (data?.apartment_stats || []).map(stat => stat.name)
  ));
  
  // 표시할 거래 필터링 - 안전한 처리
  const allDeals = data?.deals || [];
  const displayDeals = showNewOnly ? allDeals.filter(deal => deal.isNew) : allDeals;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* 축하 메시지 */}
      {celebrationMessage && (
        <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg animate-bounce">
          {celebrationMessage}
        </div>
      )}
      
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-800 flex items-center">
          🏠 논현동 아파트 실거래가
        </h2>
        <div className="text-xs text-gray-500">
          {data?.statistics?.period || '데이터 로딩중'}
          {lastUpdateTime && ` • ${getTimeAgo(lastUpdateTime)}`}
        </div>
      </div>

      {/* 컨트롤 버튼 */}
      <div className="mb-4 flex flex-col sm:flex-row gap-2">
        <button
          onClick={fetchRealEstateData}
          disabled={loading}
          className="flex items-center justify-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          <span>새로고침</span>
        </button>

        <button
          onClick={compareWithPreviousData}
          disabled={isComparing || !hasStoredData}
          className="flex items-center justify-center space-x-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
        >
          {isComparing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4" />
          )}
          <span>신규 거래 확인</span>
        </button>

        {newTransactions.length > 0 && (
          <div className="flex space-x-2">
            <button
              onClick={() => setShowNewOnly(true)}
              className={`px-3 py-2 rounded-lg transition-colors text-sm ${
                showNewOnly
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              신규만 보기 ({newTransactions.length})
            </button>
            <button
              onClick={() => setShowNewOnly(false)}
              className={`px-3 py-2 rounded-lg transition-colors text-sm ${
                !showNewOnly
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              전체 보기 ({allDeals.length})
            </button>
          </div>
        )}
      </div>

      {/* 안내 메시지 */}
      {!hasStoredData && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start space-x-2">
            <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-blue-800">
              <p className="font-medium">🎯 신규 거래 확인 방법:</p>
              <p>1. 먼저 &quot;🔄 새로고침&quot;을 클릭하여 현재 데이터를 저장하세요</p>
              <p>2. 다음날 &quot;🆕 신규 거래 확인&quot;을 클릭하면 새로운 거래를 자동으로 탐지합니다</p>
            </div>
          </div>
        </div>
      )}

      {/* 검색 입력 */}
      <div className="mb-4">
        <label htmlFor="apartment-search" className="sr-only">단지 검색</label>
        <input
          id="apartment-search"
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          list="apartment-options"
          placeholder="단지명을 입력하세요 (예: 에코메트로)"
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
        />
        <datalist id="apartment-options">
          {apartmentNames.map((name) => (
            <option key={name} value={name} />
          ))}
        </datalist>
      </div>
      
      {/* 전체 통계 요약 */}
      <div className="grid grid-cols-3 gap-2 mb-2 p-2 bg-gray-50 rounded-lg">
        <div className="text-center">
          <p className="text-xs text-gray-600">평균가</p>
          <p className="text-xs sm:text-sm font-semibold text-blue-600 sm:whitespace-nowrap">{data?.statistics?.avg_price || '계산중'}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-600">최고가</p>
          <p className="text-xs sm:text-sm font-semibold text-red-600 sm:whitespace-nowrap">{data?.statistics?.max_price || '계산중'}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-600">최저가</p>
          <p className="text-xs sm:text-sm font-semibold text-green-600 sm:whitespace-nowrap">{data?.statistics?.min_price || '계산중'}</p>
        </div>
      </div>
      
      {/* 좌우 2단 레이아웃 */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* 최신 거래 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-bold text-blue-700">
              최신 거래
              {showNewOnly && newTransactions.length > 0 && (
                <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                  신규 {newTransactions.length}건
                </span>
              )}
            </h3>
            <button
              onClick={() => setShowAllDeals(!showAllDeals)}
              className="text-xs text-blue-600 hover:text-blue-800 transition-colors"
            >
              {showAllDeals ? '접기' : `전체보기 (${displayDeals.length}건)`}
            </button>
          </div>
          <div className="space-y-2 max-h-96 overflow-y-auto custom-scrollbar pr-10 md:pr-6 pb-3">
            {displayDeals.slice(0, showAllDeals ? displayDeals.length : 10).map((deal, index) => (
              <div 
                key={deal.uniqueId || index} 
                className={`border-l-4 pl-3 py-1.5 rounded-r transition-all ${
                  deal.isNew 
                    ? 'border-green-500 bg-green-50 animate-pulse' 
                    : 'border-blue-500 bg-gray-50'
                }`}
              >
                <div className="flex justify-between items-start mb-0.5">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-semibold text-gray-800 text-sm">{deal.apartment_name}</h3>
                    {deal.isNew && (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 animate-bounce">
                        ✨ NEW
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-gray-500">{deal.deal_date}</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="text-xs text-gray-600">
                    <span>{deal.area} • {deal.floor} • {deal.build_year}년</span>
                  </div>
                  <div className="text-right pr-1 md:pr-2 lg:pr-3">
                    <p className="font-bold text-blue-600 text-sm">{deal.price}</p>
                    <p className="text-xs text-gray-500">평당 {deal.price_per_pyeong}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 단지별 통계 */}
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-green-700 mb-1">단지별 통계</h3>
          <div className="space-y-2 max-h-96 overflow-y-auto custom-scrollbar">
            {(data?.apartment_stats || []).map((stat, index) => (
              <div
                key={index}
                ref={(el) => { apartmentRefs.current[stat.name] = el; }}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  highlight === stat.name
                    ? 'border-yellow-400 bg-yellow-50 shadow-md scale-105'
                    : expandedApartment === stat.name
                    ? 'border-green-400 bg-green-50'
                    : 'border-gray-200 bg-white hover:bg-gray-50'
                }`}
                onClick={() => setExpandedApartment(expandedApartment === stat.name ? null : stat.name)}
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <h4 className="font-semibold text-sm text-gray-800">{stat.name}</h4>
                    {stat.newCount && stat.newCount > 0 && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        NEW {stat.newCount}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-gray-500">{stat.count}건</span>
                </div>
                <p className="text-sm font-bold text-green-600 mt-1">{stat.avg_price}</p>
                
                {/* 확장된 상세 정보 */}
                {expandedApartment === stat.name && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="flex justify-between items-center mb-2">
                      <h5 className="text-xs font-semibold text-gray-700">모든 거래 내역</h5>
                      <span className="text-xs text-gray-500">
                        {allDeals.filter(deal => deal.apartment_name === stat.name).length}건
                      </span>
                    </div>
                    <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
                      {allDeals
                        .filter(deal => deal.apartment_name === stat.name)
                        .map((deal, idx) => (
                          <div key={deal.uniqueId || idx} className={`text-xs p-2 rounded transition-all ${deal.isNew ? 'bg-green-100 border border-green-300' : 'bg-gray-100 hover:bg-gray-200'}`}>
                            <div className="flex justify-between items-center">
                              <span className="font-medium">{deal.area} • {deal.floor}</span>
                              <span className="text-blue-600 font-semibold">{deal.price}</span>
                            </div>
                            <div className="flex justify-between items-center mt-1">
                              <span className="text-gray-500">{deal.build_year}년</span>
                              <span className="text-gray-500">{deal.deal_date}</span>
                            </div>
                            <div className="mt-1 text-gray-400">
                              <span>평당 {deal.price_per_pyeong}</span>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 스타일 */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #a8a8a8;
        }
      `}</style>
    </div>
  );
} 