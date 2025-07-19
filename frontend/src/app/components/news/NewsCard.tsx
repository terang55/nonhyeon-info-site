/**
 * 개별 뉴스 카드 컴포넌트
 */

import React from 'react';
import Image from 'next/image';
import { NewsItem } from '@/types/news';
import { getTypeIcon, getTypeLabel, getCategoryColor } from '@/lib/newsUtils';
import { formatDate } from '@/lib/dateUtils';

interface NewsCardProps {
  item: NewsItem;
  index: number;
}

const NewsCard = React.memo(function NewsCard({ item, index }: NewsCardProps) {
  return (
    <div
      key={index}
      className="bg-white rounded-xl shadow-sm border hover:shadow-md transition-all duration-200 overflow-hidden"
    >
      {/* 유튜브 썸네일 */}
      {item.type === 'youtube' && item.thumbnail && (
        <div className="aspect-video bg-gray-100 rounded-t-lg overflow-hidden relative">
          <Image 
            src={item.thumbnail} 
            alt={item.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
      )}
      
      <div className="p-3 sm:p-6">
        {/* 헤더 */}
        <div className="flex items-start justify-between mb-2">
          <span className={`inline-flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-medium min-h-[28px] sm:min-h-[36px] ${
            item.type === 'youtube' ? 'bg-red-100 text-red-800' :
            item.type === 'blog' ? 'bg-green-100 text-green-800' :
            getCategoryColor(item.type)
          }`}>
            {getTypeIcon(item.type)} {getTypeLabel(item.type)}
          </span>
          <span className="text-xs sm:text-sm text-gray-600 flex-shrink-0 ml-2">
            {item.type === 'youtube' ? item.views : ''}
          </span>
        </div>
        
        {/* 제목 */}
        <h3 className="text-sm sm:text-lg font-semibold text-gray-900 mb-2 line-clamp-2 leading-tight">
          <a 
            href={item.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="hover:text-blue-600 transition-colors touch-manipulation"
          >
            {item.title}
          </a>
        </h3>
        
        {/* 내용 (유튜브가 아닌 경우만) */}
        {item.type !== 'youtube' && (
          <p className="text-gray-700 text-xs sm:text-sm mb-2 sm:mb-3 line-clamp-2 leading-tight">
            {item.content}
          </p>
        )}
        
        {/* 메타 정보 */}
        <div className="flex items-center justify-between text-xs sm:text-sm pt-2 border-t border-gray-100">
          <span className="font-medium text-gray-900 truncate mr-2 flex items-center gap-1 flex-1 min-w-0">
            <span className="text-gray-500 text-xs">🏢</span>
            <span className="min-w-0 truncate text-xs sm:text-sm">
              {item.type === 'youtube' ? item.channel : item.source}
            </span>
          </span>
          <span className="text-gray-600 text-xs flex-shrink-0 flex items-center gap-1">
            <span className="text-gray-500">🕒</span>
            {item.type === 'youtube' ? 
              (item.upload_time && item.upload_time.trim() !== '' && !item.upload_time.includes('불명') ? item.upload_time : '') : 
              formatDate(item.date, item)
            }
          </span>
        </div>
        
        {/* 키워드 */}
        {item.keyword && (
          <div className="mt-2 pt-2 border-t">
            <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium min-h-[24px] ${
              item.type === 'youtube' ? 'bg-red-100 text-red-700' :
              item.type === 'blog' ? 'bg-green-100 text-green-700' :
              'bg-blue-100 text-blue-700'
            }`}>
              #{item.keyword}
            </span>
          </div>
        )}
      </div>
    </div>
  );
});

export default NewsCard;