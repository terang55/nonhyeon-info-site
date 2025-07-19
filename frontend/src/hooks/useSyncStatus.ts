/**
 * 동기화 상태 관리를 위한 커스텀 훅
 */

import { useState, useCallback } from 'react';
import { SyncStatus } from '@/types/news';

interface UseSyncStatusReturn {
  syncStatus: SyncStatus | null;
  fetchSyncStatus: () => Promise<void>;
}

export function useSyncStatus(): UseSyncStatusReturn {
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);

  const fetchSyncStatus = useCallback(async () => {
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
  }, []);

  return {
    syncStatus,
    fetchSyncStatus,
  };
}