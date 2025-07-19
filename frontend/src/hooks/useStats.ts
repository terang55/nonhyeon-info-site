/**
 * 통계 데이터 관리를 위한 커스텀 훅
 */

import { useState, useCallback } from 'react';
import { StatsData } from '@/types/news';

interface UseStatsReturn {
  stats: StatsData | null;
  fetchStats: () => Promise<void>;
}

export function useStats(): UseStatsReturn {
  const [stats, setStats] = useState<StatsData | null>(null);

  const fetchStats = useCallback(async () => {
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
  }, []);

  return {
    stats,
    fetchStats,
  };
}