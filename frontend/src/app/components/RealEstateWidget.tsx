'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Loader2, RefreshCw } from 'lucide-react';

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
  newTransactionsFromYesterday?: Deal[];
  newCountFromYesterday?: number;
  baselineDate?: string | null;
  yesterdayDate?: string | null;
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
  // 어제 대비 신규 거래 전체보기 토글 상태
  const [showAllNewYesterday, setShowAllNewYesterday] = useState(false);
  const [expandedApartment, setExpandedApartment] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [highlight, setHighlight] = useState<string | null>(null);
  const [newTransactionsFromYesterday, setNewTransactionsFromYesterday] = useState<Deal[]>([]);
  const [yesterdayDate, setYesterdayDate] = useState<string | null>(null);
  
  const apartmentRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    fetchRealEstateData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
        setNewTransactionsFromYesterday(result.newTransactionsFromYesterday || []);
        setYesterdayDate(result.yesterdayDate || null);
        
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
  
  // 표시할 거래 - 안전한 처리
  const allDeals = data?.deals || [];

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-800 flex items-center">
          🏠 논현동 아파트 실거래가
        </h2>
        <div className="text-sm text-gray-600">
          {data?.statistics?.period || '데이터 로딩중'}
        </div>
      </div>

            {/* 컨트롤 버튼 - 새로고침만 유지 */}
      <div className="mb-4 flex justify-between items-center">
        <button
          onClick={fetchRealEstateData}
          disabled={loading}
          className="flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm min-h-[44px]"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          <span>새로고침</span>
        </button>

        {/* 안내 문구 삭제 */}
      </div>

      {/* 어제 대비 신규 거래 섹션 - 항상 표시 */}
      <div className="mb-4">
        <div className={`rounded-lg p-4 ${
          newTransactionsFromYesterday.length > 0 
            ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200'
            : 'bg-gray-50 border border-gray-200'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <h3 className={`font-bold flex items-center ${
              newTransactionsFromYesterday.length > 0 ? 'text-orange-700' : 'text-gray-600'
            }`}>
              ✨ 어제 대비 신규 거래
              {newTransactionsFromYesterday.length > 0 ? (
                <span className="ml-2 text-sm bg-orange-100 text-orange-800 px-3 py-2 rounded-full min-h-[32px] flex items-center">
                  {newTransactionsFromYesterday.length}건 신규
                </span>
              ) : (
                <span className="ml-2 text-sm bg-gray-100 text-gray-700 px-3 py-2 rounded-full min-h-[32px] flex items-center">
                  신규 거래 없음
                </span>
              )}
            </h3>
            {yesterdayDate && (
              <div className={`text-sm ${
                newTransactionsFromYesterday.length > 0 ? 'text-orange-700' : 'text-gray-600'
              }`}>
                기준: {yesterdayDate}
              </div>
            )}
          </div>
          
          {newTransactionsFromYesterday.length > 0 ? (
            <div
              className={`${showAllNewYesterday ? 'overflow-visible' : 'max-h-64 overflow-y-auto'} grid grid-cols-2 gap-2`}
            >
              {newTransactionsFromYesterday.slice(0, showAllNewYesterday ? newTransactionsFromYesterday.length : 5).map((deal, idx) => (
                <div
                  key={`new-yesterday-${deal.uniqueId || idx}`}
                  className="bg-white border border-orange-200 rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-1 sm:space-x-2 mb-1 flex-1 min-w-0">
                        <span className="font-semibold text-gray-900 text-xs sm:text-sm sm:truncate">
                          {deal.apartment_name}
                        </span>
                        <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full font-medium flex-shrink-0">
                          NEW
                        </span>
                      </div>
                      <div className="text-xs sm:text-sm text-gray-700 space-y-0.5 leading-relaxed">
                        <div>{deal.area} • {deal.floor} • {deal.build_year}년</div>
                        <div className="text-orange-700 font-medium">평당 {deal.price_per_pyeong}</div>
                      </div>
                    </div>
                    <div className="text-right ml-2 flex-shrink-0">
                      <div className="font-bold text-orange-800 text-sm sm:text-base">{deal.price}</div>
                      <div className="text-xs text-gray-600">{deal.deal_date}</div>
                    </div>
                  </div>
                </div>
              ))}
              
              {newTransactionsFromYesterday.length > 5 && (
                <div className="text-center pt-2">
                  <button
                    onClick={() => setShowAllNewYesterday(!showAllNewYesterday)}
                    className="text-sm text-orange-700 hover:text-orange-900 transition-colors px-3 py-2 min-h-[36px]"
                  >
                    {showAllNewYesterday
                      ? '접기'
                      : `더보기 (${newTransactionsFromYesterday.length - 5}건)`}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-6">
              <div className="text-gray-700 text-base leading-relaxed">
                😊 어제와 비교했을 때 신규 거래가 없습니다
              </div>
              <div className="text-gray-600 text-sm mt-1 leading-relaxed">
                새로운 거래가 등록되면 자동으로 여기에 표시됩니다
              </div>
            </div>
          )}
        </div>
      </div>

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
          className="w-full border border-gray-300 rounded px-4 py-3 text-base focus:ring-blue-500 focus:border-blue-500 min-h-[44px]"
        />
        <datalist id="apartment-options">
          {apartmentNames.map((name) => (
            <option key={name} value={name} />
          ))}
        </datalist>
      </div>
      
      {/* 전체 통계 요약 */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="bg-white border border-blue-200 rounded-lg p-2 sm:p-3 text-center shadow-sm">
          <p className="text-xs sm:text-sm text-blue-700 font-medium mb-1">평균가</p>
          <p className="text-sm sm:text-base font-bold text-blue-800 leading-tight">{data?.statistics?.avg_price || '계산중'}</p>
        </div>
        <div className="bg-white border border-red-200 rounded-lg p-2 sm:p-3 text-center shadow-sm">
          <p className="text-xs sm:text-sm text-red-700 font-medium mb-1">최고가</p>
          <p className="text-sm sm:text-base font-bold text-red-800 leading-tight">{data?.statistics?.max_price || '계산중'}</p>
        </div>
        <div className="bg-white border border-green-200 rounded-lg p-2 sm:p-3 text-center shadow-sm">
          <p className="text-xs sm:text-sm text-green-700 font-medium mb-1">최저가</p>
          <p className="text-sm sm:text-base font-bold text-green-800 leading-tight">{data?.statistics?.min_price || '계산중'}</p>
        </div>
      </div>

      {/* 좌우 2단 레이아웃 */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* 최신 거래 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
                        <h3 className="font-bold text-blue-700">
              최신 거래
            </h3>
            <button
              onClick={() => setShowAllDeals(!showAllDeals)}
              className="text-sm text-blue-700 hover:text-blue-900 transition-colors px-3 py-2 min-h-[36px]"
            >
              {showAllDeals ? '접기' : `전체보기 (${allDeals.length}건)`}
            </button>
          </div>
          <div className="space-y-2 max-h-96 overflow-y-auto custom-scrollbar pr-4 md:pr-6 pb-3">
            {allDeals.slice(0, showAllDeals ? allDeals.length : 10).map((deal: Deal, index: number) => (
              <div 
                key={deal.uniqueId || index} 
                className={`border-l-4 pl-2 sm:pl-3 py-2 rounded-r transition-all ${
                  deal.isNew 
                    ? 'border-green-500 bg-green-50 animate-pulse' 
                    : 'border-blue-500 bg-gray-50'
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <div className="flex items-center space-x-1 sm:space-x-2 flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 text-xs sm:text-sm sm:truncate">{deal.apartment_name}</h3>
                    {deal.isNew && (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 animate-bounce flex-shrink-0">
                        NEW
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-gray-600 ml-2 flex-shrink-0">{deal.deal_date}</span>
                </div>
                <div className="flex justify-between items-end">
                  <div className="text-xs sm:text-sm text-gray-700 leading-relaxed flex-1 min-w-0">
                    <span className="block sm:inline">{deal.area} • {deal.floor} • {deal.build_year}년</span>
                  </div>
                  <div className="text-right ml-2 flex-shrink-0">
                    <p className="font-bold text-blue-700 text-sm sm:text-base">{deal.price}</p>
                    <p className="text-xs text-gray-600">평당 {deal.price_per_pyeong}</p>
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
                className={`p-2 sm:p-3 rounded-lg border cursor-pointer transition-all ${
                  highlight === stat.name
                    ? 'border-yellow-400 bg-yellow-50 shadow-md scale-105'
                    : expandedApartment === stat.name
                    ? 'border-green-400 bg-green-50 shadow-sm'
                    : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-sm'
                }`}
                onClick={() => setExpandedApartment(expandedApartment === stat.name ? null : stat.name)}
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-1 sm:space-x-2 flex-1 min-w-0">
                    <h4 className="font-semibold text-xs sm:text-sm text-gray-800 sm:truncate">{stat.name}</h4>
                    {stat.newCount && stat.newCount > 0 && (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 flex-shrink-0">
                        NEW {stat.newCount}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-gray-500 ml-2 flex-shrink-0">{stat.count}건</span>
                </div>
                <p className="text-xs sm:text-sm font-bold text-green-600 mt-1">{stat.avg_price}</p>
                
                {/* 확장된 상세 정보 */}
                {expandedApartment === stat.name && (
                  <div className="mt-2 pt-2 border-t border-gray-200">
                    <div className="flex justify-between items-center mb-2">
                      <h5 className="text-xs font-semibold text-gray-700">모든 거래 내역</h5>
                      <span className="text-xs text-gray-500">
                        {allDeals.filter(deal => deal.apartment_name === stat.name).length}건
                      </span>
                    </div>
                    <div className="space-y-1.5 max-h-64 overflow-y-auto custom-scrollbar">
                      {allDeals
                        .filter(deal => deal.apartment_name === stat.name)
                        .map((deal, idx) => (
                          <div key={deal.uniqueId || idx} className={`text-xs p-2 rounded border transition-all ${
                            deal.isNew 
                              ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 shadow-sm' 
                              : 'bg-white border-gray-200 hover:border-blue-300 hover:shadow-sm'
                          }`}>
                            <div className="flex justify-between items-center">
                              <div className="flex items-center space-x-1 flex-1 min-w-0">
                                <span className="font-medium text-gray-800 text-xs sm:truncate">{deal.area} • {deal.floor}</span>
                                {deal.isNew && (
                                  <span className="inline-flex items-center px-1 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 flex-shrink-0">
                                    NEW
                                  </span>
                                )}
                              </div>
                              <span className="text-blue-600 font-bold text-xs ml-2 flex-shrink-0">{deal.price}</span>
                            </div>
                            <div className="flex justify-between items-center mt-1">
                              <span className="text-gray-600 text-xs">{deal.build_year}년</span>
                              <span className="text-gray-600 text-xs">{deal.deal_date}</span>
                            </div>
                            <div className="mt-1 pt-1 border-t border-gray-100">
                              <div className="flex justify-between items-center">
                                <span className="text-gray-500 text-xs">평당</span>
                                <span className="text-gray-700 font-semibold text-xs">{deal.price_per_pyeong}</span>
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