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

interface NewDealApiResponse {
  unique_id: string;
  아파트: string;
  전용면적: string;
  층: string;
  거래금액: string;
  deal_date: string;
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
      // 1. 먼저 신규 거래 확인
      const newDealsRes = await fetch('/api/realestate?checkNew=true');
      let newDealsData: Deal[] = [];
      
      if (newDealsRes.ok) {
        const newDealsResult = await newDealsRes.json();
        if (newDealsResult.success && newDealsResult.data) {
          newDealsData = newDealsResult.data.map((deal: NewDealApiResponse) => ({
            unique_id: deal.unique_id,
            apartment_name: deal.아파트,
            area: deal.전용면적 + '㎡',
            floor: deal.층 + '층',
            price: deal.거래금액,
            deal_date: deal.deal_date,
            isNew: true
          }));
        }
      }
      
      // 2. 전체 거래 데이터 가져오기
      const res = await fetch('/api/realestate?months=3');
      if (!res.ok) throw new Error('API 오류');
      const result = await res.json();

      if (result.data?.deals && result.data.deals.length > 0) {
        // 신규 거래 unique_id 세트 생성
        const newDealsIds = new Set(newDealsData.map(deal => deal.unique_id));
        
        // 전체 거래에 신규 플래그 설정
        const processedDeals = result.data.deals.map((deal: Deal) => ({
          ...deal,
          isNew: newDealsIds.has(deal.unique_id)
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
