'use client';

import React, { useState, useMemo } from 'react';

interface Deal {
  unique_id: string;
  apartment_name: string;
  area: string;
  floor: string;
  price: string;
  price_numeric: number;
  price_per_pyeong?: string;
  deal_date: string;
  isNew?: boolean;
}

interface ApartmentStat {
  name: string;
  count: number;
  avg_price: string;
}

interface RealEstateWidgetProps {
  deals: Deal[];
  newDeals: Deal[]; // 신규 추가된 prop
  apartmentStats: ApartmentStat[];
  onApartmentSelect: (apartmentName: string) => void;
  onRefresh: () => void;
  onShowAll: () => void;
  selectedApartment: string | null;
}

export default function RealEstateWidget({ deals, newDeals, apartmentStats, onApartmentSelect, onRefresh, onShowAll, selectedApartment }: RealEstateWidgetProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [apartmentSearchTerm, setApartmentSearchTerm] = useState('');

  // 검색 필터링된 거래
  const filteredDeals = useMemo(() => {
    if (!searchTerm.trim()) return deals;
    return deals.filter(deal => 
      deal.apartment_name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [deals, searchTerm]);

  // 검색 필터링된 아파트 통계
  const filteredApartmentStats = useMemo(() => {
    if (!apartmentSearchTerm.trim()) return apartmentStats;
    return apartmentStats.filter(apt => 
      apt.name.toLowerCase().includes(apartmentSearchTerm.toLowerCase())
    );
  }, [apartmentStats, apartmentSearchTerm]);

  // 통계 계산
  const statistics = useMemo(() => {
    const displayDeals = selectedApartment ? filteredDeals : deals;
    
    if (displayDeals.length === 0) {
      return {
        avgPrice: 0,
        maxPrice: 0,
        minPrice: 0,
        totalCount: 0,
        avgPriceText: '0만원',
        maxPriceText: '0만원',
        minPriceText: '0만원'
      };
    }

    const prices = displayDeals.map(deal => deal.price_numeric);
    const avg = Math.round(prices.reduce((sum, price) => sum + price, 0) / prices.length);
    const max = Math.max(...prices);
    const min = Math.min(...prices);

    const formatPrice = (price: number): string => {
      if (price >= 10000) {
        const eok = Math.floor(price / 10000);
        const man = price % 10000;
        if (man === 0) {
          return `${eok}억원`;
        } else {
          return `${eok}억 ${man.toLocaleString()}만원`;
        }
      } else {
        return `${price.toLocaleString()}만원`;
      }
    };

    return {
      avgPrice: avg,
      maxPrice: max,
      minPrice: min,
      totalCount: displayDeals.length,
      avgPriceText: formatPrice(avg),
      maxPriceText: formatPrice(max),
      minPriceText: formatPrice(min)
    };
  }, [deals, filteredDeals, selectedApartment]);

  return (
    <div className="flex flex-col gap-6">
      {/* 검색창 */}
      <section className="bg-white rounded-xl shadow p-6">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="단지명을 입력하세요 (예: 송도센트럴파크)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              초기화
            </button>
          )}
        </div>
      </section>

      {/* 통계 카드 */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{statistics.avgPriceText}</div>
          <div className="text-sm text-gray-500 mt-1">평균가</div>
        </div>
        <div className="bg-white rounded-xl shadow p-4 text-center">
          <div className="text-2xl font-bold text-red-600">{statistics.maxPriceText}</div>
          <div className="text-sm text-gray-500 mt-1">최고가</div>
        </div>
        <div className="bg-white rounded-xl shadow p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{statistics.minPriceText}</div>
          <div className="text-sm text-gray-500 mt-1">최저가</div>
        </div>
        <div className="bg-white rounded-xl shadow p-4 text-center">
          <div className="text-2xl font-bold text-gray-800">{statistics.totalCount}건</div>
          <div className="text-sm text-gray-500 mt-1">총 거래</div>
        </div>
      </section>

      {/* 신규 거래 섹션 */}
      {!selectedApartment && newDeals.length > 0 && (
        <section className="bg-white rounded-xl shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold text-lg text-green-700">✨ 신규 거래</h2>
            <span className="text-gray-400 text-sm">총 {newDeals.length}건</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {newDeals.map((deal) => (
              <div key={deal.unique_id} className="rounded-lg p-4 bg-green-50 border border-green-200 flex flex-col">
                <span className="font-semibold text-base text-green-800">{deal.apartment_name}</span>
                <div className="text-xs text-gray-600">{deal.area} · {deal.floor}</div>
                <div className="flex justify-between items-end mt-2">
                  <span className="text-blue-600 font-bold text-lg">{deal.price}</span>
                  <span className="text-xs text-gray-500">{deal.deal_date}</span>
                </div>
                {deal.price_per_pyeong && (
                  <div className="text-xs text-gray-500">평당 {deal.price_per_pyeong}</div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 최신 거래 및 아파트별 통계 섹션 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 최신 거래 */}
        <section className="bg-white rounded-xl shadow p-6 flex flex-col max-h-[600px]">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold text-lg">
              {selectedApartment ? `${selectedApartment} 거래` : '최신 거래'}
            </h2>
            <span className="text-gray-400 text-sm">최근 {filteredDeals.length}건</span>
          </div>
          <div className="flex-1 overflow-y-auto space-y-3">
            {filteredDeals.length > 0 ? (
              filteredDeals.map((deal) => (
                <div key={deal.unique_id} className={`rounded-lg p-4 flex flex-col ${deal.isNew ? 'bg-green-50 border border-green-200' : 'bg-gray-50'}`}>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-base">{deal.apartment_name}</span>
                    {deal.isNew && (
                      <span className="bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">NEW</span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500">{deal.area} · {deal.floor}</div>
                  <div className="flex justify-between items-end mt-2">
                    <span className="text-blue-600 font-bold text-lg">{deal.price}</span>
                    <span className="text-xs text-gray-400">{deal.deal_date}</span>
                  </div>
                  {deal.price_per_pyeong && (
                    <div className="text-xs text-gray-400">평당 {deal.price_per_pyeong}</div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500 py-10">
                {searchTerm ? `"${searchTerm}"에 대한 검색 결과가 없습니다.` : 
                 selectedApartment ? '선택하신 아파트의 거래 내역이 없습니다.' : '거래 내역이 없습니다.'}
              </div>
            )}
          </div>
          <div className="flex gap-2 mt-4">
            {selectedApartment && (
              <button onClick={onShowAll} className="bg-green-500 hover:bg-green-600 text-white px-4 py-1 rounded font-semibold text-sm">전체보기</button>
            )}
            <button onClick={onRefresh} className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1 rounded font-semibold text-sm">새로고침</button>
          </div>
        </section>
        {/* 아파트별 통계 */}
        <section className="bg-white rounded-xl shadow p-6 flex flex-col max-h-[600px]">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold text-lg">아파트별 통계</h2>
            <span className="text-gray-400 text-sm">{filteredApartmentStats.length}개 단지</span>
          </div>
          
          {/* 아파트 검색창 */}
          <div className="mb-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="아파트 검색..."
                value={apartmentSearchTerm}
                onChange={(e) => setApartmentSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {filteredApartmentStats.length > 0 ? (
              <div className="space-y-2">
                {filteredApartmentStats.map((apt, index) => (
                  <div 
                    key={apt.name} 
                    className={`rounded-lg p-4 cursor-pointer hover:bg-blue-50 transition-colors border ${
                      selectedApartment === apt.name ? 'bg-blue-100 border-blue-300' : 'bg-gray-50 border-gray-200'
                    }`}
                    onClick={() => onApartmentSelect(apt.name)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-800">{apt.name}</span>
                          <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">
                            {index + 1}위
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">거래 {apt.count}건</div>
                      </div>
                      <div className="text-right">
                        <div className="text-blue-700 font-bold text-lg">{apt.avg_price}</div>
                        <div className="text-xs text-gray-400">평균가</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-10">
                {apartmentSearchTerm ? `"${apartmentSearchTerm}"에 대한 검색 결과가 없습니다.` : '아파트 통계가 없습니다.'}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
