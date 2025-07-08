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
  baselineDate?: string | null;
  location: string;
  timestamp: string;
}

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
  const [baselineDate, setBaselineDate] = useState<string | null>(null);
  const [isUpdatingBaseline, setIsUpdatingBaseline] = useState(false);
  const [celebrationMessage, setCelebrationMessage] = useState<string | null>(null);
  
  const apartmentRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    fetchRealEstateData();
  }, []);

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
        
        // 신규 거래 정보 설정
        setNewTransactions(result.newTransactions || []);
        setBaselineDate(result.baselineDate || null);
        
        console.log('✅ 부동산 데이터 로드 완료:', dealsWithIds.length, '건');
      } else {
        setError('실거래가 정보를 불러올 수 없습니다.');
      }
    } catch (error) {
      console.error('실거래가 데이터 로딩 오류:', error);
      setError('데이터 로딩 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }, []);

  // 기준 데이터 업데이트 함수
  const updateBaselineData = useCallback(async () => {
    try {
      setIsUpdatingBaseline(true);
      setError(null);

      console.log('🔄 기준 데이터 업데이트 시작');
      
      // POST API로 기준 데이터 업데이트 요청
      const response = await fetch('/api/realestate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        },
        body: JSON.stringify({
          action: 'update_baseline'
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('🔍 기준 데이터 업데이트 결과:', result);

      if (result.success) {
        setCelebrationMessage(`✅ 기준 데이터가 업데이트되었습니다! (${result.baselineCount}건)`);
        
        // 데이터 새로고침
        await fetchRealEstateData();
        
        // 메시지 3초 후 제거
        setTimeout(() => setCelebrationMessage(null), 3000);
        
        console.log('✅ 기준 데이터 업데이트 완료:', result.baselineCount, '건');
      } else {
        setError('기준 데이터 업데이트에 실패했습니다.');
      }
      
    } catch (error) {
      console.error('기준 데이터 업데이트 오류:', error);
      setError('기준 데이터 업데이트 중 오류가 발생했습니다.');
    } finally {
      setIsUpdatingBaseline(false);
    }
  }, []);

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
          {baselineDate && ` • 기준: ${baselineDate}`}
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
          onClick={updateBaselineData}
          disabled={isUpdatingBaseline}
          className="flex items-center justify-center space-x-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
        >
          {isUpdatingBaseline ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4" />
          )}
          <span>📌 기준점 설정</span>
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

      {/* 축하 메시지 */}
      {celebrationMessage && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg animate-pulse">
          <div className="text-sm text-green-800 font-medium text-center">
            {celebrationMessage}
          </div>
        </div>
      )}

      {/* 안내 메시지 */}
      {!baselineDate && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start space-x-2">
            <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-blue-800">
              <p className="font-medium">🎯 신규 거래 확인 방법:</p>
              <p>1. 먼저 &quot;📌 기준점 설정&quot;을 클릭하여 현재 데이터를 기준으로 설정하세요</p>
              <p>2. 다음날 새로고침하면 기준점 이후의 신규 거래가 자동으로 표시됩니다</p>
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
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-white border border-blue-200 rounded-lg p-3 text-center shadow-sm">
          <p className="text-xs text-blue-600 font-medium mb-1">평균가</p>
          <p className="text-sm font-bold text-blue-700 sm:whitespace-nowrap">{data?.statistics?.avg_price || '계산중'}</p>
        </div>
        <div className="bg-white border border-red-200 rounded-lg p-3 text-center shadow-sm">
          <p className="text-xs text-red-600 font-medium mb-1">최고가</p>
          <p className="text-sm font-bold text-red-700 sm:whitespace-nowrap">{data?.statistics?.max_price || '계산중'}</p>
        </div>
        <div className="bg-white border border-green-200 rounded-lg p-3 text-center shadow-sm">
          <p className="text-xs text-green-600 font-medium mb-1">최저가</p>
          <p className="text-sm font-bold text-green-700 sm:whitespace-nowrap">{data?.statistics?.min_price || '계산중'}</p>
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
                    ? 'border-green-400 bg-green-50 shadow-sm'
                    : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-sm'
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
                          <div key={deal.uniqueId || idx} className={`text-xs p-3 rounded-lg border transition-all ${
                            deal.isNew 
                              ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 shadow-sm' 
                              : 'bg-white border-gray-200 hover:border-blue-300 hover:shadow-sm'
                          }`}>
                            <div className="flex justify-between items-center">
                              <div className="flex items-center space-x-2">
                                <span className="font-medium text-gray-800">{deal.area} • {deal.floor}</span>
                                {deal.isNew && (
                                  <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    NEW
                                  </span>
                                )}
                              </div>
                              <span className="text-blue-600 font-bold text-sm">{deal.price}</span>
                            </div>
                            <div className="flex justify-between items-center mt-2">
                              <span className="text-gray-600">{deal.build_year}년 건축</span>
                              <span className="text-gray-600 font-medium">{deal.deal_date}</span>
                            </div>
                            <div className="mt-2 pt-2 border-t border-gray-100">
                              <div className="flex justify-between items-center">
                                <span className="text-gray-500 text-xs">평당 가격</span>
                                <span className="text-gray-700 font-semibold">{deal.price_per_pyeong}</span>
                              </div>
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