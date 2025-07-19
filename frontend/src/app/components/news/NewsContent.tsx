/**
 * 뉴스 메인 컨테이너 컴포넌트
 */

import React from 'react';
import { NewsItem } from '@/types/news';
import NewsGrid from './NewsGrid';
import { ErrorState, LoadingState, EmptyState } from './NewsStates';

interface NewsContentProps {
  news: NewsItem[];
  loading: boolean;
  error: string | null;
}

export default function NewsContent({ news, loading, error }: NewsContentProps) {
  return (
    <div className="flex-1">
      {/* 에러 메시지 */}
      {error && <ErrorState error={error} />}
      
      {/* 로딩 상태 */}
      {loading && <LoadingState />}
      
      {/* 뉴스 그리드 */}
      {!loading && news.length > 0 && <NewsGrid news={news} />}
      
      {/* 빈 상태 */}
      {!loading && news.length === 0 && !error && <EmptyState />}
    </div>
  );
}