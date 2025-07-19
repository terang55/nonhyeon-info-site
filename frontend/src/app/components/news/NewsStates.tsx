/**
 * 뉴스 로딩, 에러, 빈 상태 컴포넌트들
 */

import React from 'react';

interface ErrorStateProps {
  error: string;
}

export function ErrorState({ error }: ErrorStateProps) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
      <div className="flex">
        <div className="flex-shrink-0">
          <span className="text-red-400">⚠️</span>
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-red-800">오류 발생</h3>
          <div className="mt-2 text-sm text-red-700">{error}</div>
        </div>
      </div>
    </div>
  );
}

export function LoadingState() {
  return (
    <div className="text-center py-8 sm:py-12">
      <div className="inline-block animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-blue-600"></div>
      <p className="mt-2 text-base sm:text-lg text-gray-700 leading-relaxed">데이터를 불러오는 중...</p>
    </div>
  );
}

export function EmptyState() {
  return (
    <div className="text-center py-8 sm:py-12">
      <div className="text-4xl sm:text-6xl mb-3 sm:mb-4">🤔</div>
      <h3 className="text-lg sm:text-xl font-medium text-gray-900 mb-2 leading-relaxed">
        검색 결과가 없습니다
      </h3>
      <p className="text-base sm:text-lg text-gray-700 leading-relaxed">
        다른 키워드나 카테고리로 검색해보세요.
      </p>
    </div>
  );
}