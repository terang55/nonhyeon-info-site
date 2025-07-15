'use client';

import React, { useEffect, useState } from 'react';
import RealEstateWidget from '../components/RealEstateWidget';

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

export default function RealEstateClientPage() {
  const [allDeals, setAllDeals] = useState<Deal[]>([]);
  const [apartmentStats, setApartmentStats] = useState<ApartmentStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedApartment, setSelectedApartment] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/realestate?months=3');
      if (!res.ok) throw new Error('API 오류');
      const result = await res.json();

      if (result.data?.deals && result.data.deals.length > 0) {
        // 1. 날짜 문자열을 Date 객체로 변환
        const dealsWithDateObjects = result.data.deals.map((deal: Deal) => ({
          ...deal,
          // 'YYYY.MM.DD' 형식을 'YYYY-MM-DD'로 변환하여 Date 객체 생성
          dealDateObject: new Date(deal.deal_date.replace(/\./g, '-')),
        }));

        // 2. 가장 최근 거래 날짜 찾기 (getTime()으로 유효한 날짜만 필터링)
        const validTimes = dealsWithDateObjects
          .map((d: Deal & { dealDateObject: Date }) => d.dealDateObject.getTime())
          .filter((t: number) => !isNaN(t));
        
        let mostRecentTime = 0;
        if (validTimes.length > 0) {
            mostRecentTime = Math.max(...validTimes);
        }

        // 3. isNew 플래그 설정
        const processedDeals = dealsWithDateObjects.map((deal: Deal & { dealDateObject: Date }) => ({
          ...deal,
          // 가장 최근 거래와 날짜가 동일한 모든 거래를 신규로 표시
          isNew: deal.dealDateObject && !isNaN(deal.dealDateObject.getTime()) && deal.dealDateObject.getTime() === mostRecentTime,
        }));
        setAllDeals(processedDeals);
      } else {
        setAllDeals([]);
      }

      setApartmentStats(result.data?.apartment_stats || []);
    } catch (e: unknown) {
      console.error("Fetching or processing data failed", e);
      setError(e instanceof Error ? e.message : '데이터 로딩 실패');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApartmentSelect = (apartmentName: string) => {
    setSelectedApartment(apartmentName);
  };

  const handleShowAll = () => {
    setSelectedApartment(null);
  };

  const handleRefresh = () => {
    fetchData();
  };

  const filteredDeals = selectedApartment
    ? allDeals.filter(deal => deal.apartment_name === selectedApartment)
    : allDeals;

  const newDeals = allDeals.filter(deal => deal.isNew);

  return (
    <div>
      {loading ? (
        <div className="text-center text-gray-500">데이터 불러오는 중...</div>
      ) : error ? (
        <div className="text-center text-red-500">{error}</div>
      ) : (
        <RealEstateWidget 
          deals={filteredDeals} 
          newDeals={newDeals}
          apartmentStats={apartmentStats} 
          onApartmentSelect={handleApartmentSelect}
          onShowAll={handleShowAll}
          onRefresh={handleRefresh}
          selectedApartment={selectedApartment}
        />
      )}
    </div>
  );
}
