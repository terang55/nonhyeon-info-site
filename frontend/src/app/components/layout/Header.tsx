/**
 * 메인 헤더 컴포넌트
 */

import React from 'react';
import { SyncStatus } from '@/types/news';

interface HeaderProps {
  syncStatus: SyncStatus | null;
}

export default function Header({ syncStatus }: HeaderProps) {
  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          <div className="flex items-center space-x-3">
            <span className="text-3xl sm:text-4xl">🏙️</span>
            <div className="flex-1">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">🏠 인천논현라이프</h1>
              <p className="text-sm sm:text-base text-gray-500">논현동에서의 매일매일</p>
              {/* 모바일에서도 업데이트 시간 표시 */}
              <div className="flex sm:hidden items-center space-x-1 mt-1">
                <span className="text-xs">🔄</span>
                <span className="text-xs text-gray-500">
                  {syncStatus && syncStatus.status === 'synced' && syncStatus.lastSync 
                    ? `${new Date(syncStatus.lastSync).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`
                    : '동기화 대기중'
                  }
                </span>
              </div>
            </div>
          </div>
          <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-600">
            {/* 데스크톱 업데이트 상태 표시 */}
            <div className="flex items-center space-x-1">
              <span className="text-base">🔄</span>
              <span className="text-sm">
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
  );
}