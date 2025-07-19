/**
 * 뉴스 그리드 레이아웃 컴포넌트
 */

import React from 'react';
import { NewsItem } from '@/types/news';
import NewsCard from './NewsCard';

interface NewsGridProps {
  news: NewsItem[];
}

export default function NewsGrid({ news }: NewsGridProps) {
  return (
    <div className="grid gap-3 sm:gap-6 md:grid-cols-3 xl:grid-cols-3">
      {news.map((item, index) => (
        <NewsCard key={index} item={item} index={index} />
      ))}
    </div>
  );
}