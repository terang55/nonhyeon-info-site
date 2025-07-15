'use client';

import React from 'react';

interface Deal {
  unique_id: string;
  apartment_name: string;
  area: string;
  floor: string;
  price: string;
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
  return (
    <div className="flex flex-col gap-6">
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
            <span className="text-gray-400 text-sm">최근 {deals.length}건</span>
          </div>
          <div className="flex-1 overflow-y-auto space-y-3">
            {deals.length > 0 ? (
              deals.map((deal) => (
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
                {selectedApartment ? '선택하신 아파트의 거래 내역이 없습니다.' : '거래 내역이 없습니다.'}
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
            <span className="text-gray-400 text-sm">{apartmentStats.length}개 단지</span>
          </div>
          <div className="flex-1 overflow-y-auto space-y-3">
            {apartmentStats.map((apt) => (
              <div 
                key={apt.name} 
                className="rounded-lg p-4 bg-gray-50 flex justify-between items-center cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => onApartmentSelect(apt.name)}
              >
                <div>
                  <span className="font-semibold">{apt.name}</span>
                  <span className="ml-2 text-xs text-gray-400">{apt.count}건</span>
                </div>
                <span className="text-blue-700 font-bold">{apt.avg_price}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
