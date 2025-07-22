'use client';

import { TocItem } from '@/types/guide';
import { useEffect, useState } from 'react';

interface Props {
  tocItems: TocItem[];
}

export default function TableOfContents({ tocItems }: Props) {
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    // 스크롤 위치에 따른 활성 헤딩 감지
    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries.filter((entry) => entry.isIntersecting);
        if (visibleEntries.length > 0) {
          const closestEntry = visibleEntries.reduce((closest, entry) => {
            return entry.intersectionRatio > closest.intersectionRatio ? entry : closest;
          });
          setActiveId(closestEntry.target.id);
        }
      },
      {
        rootMargin: '0px 0px -80% 0px',
        threshold: [0, 0.25, 0.5, 0.75, 1]
      }
    );

    // 모든 헤딩 요소를 관찰 대상으로 등록
    tocItems.forEach((item) => {
      const element = document.getElementById(item.id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => {
      observer.disconnect();
    };
  }, [tocItems]);

  const handleClick = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  if (tocItems.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6 sticky top-8">
      <h3 className="font-bold text-gray-900 mb-4 flex items-center">
        <span className="mr-2">📋</span>
        목차
      </h3>
      
      <nav className="space-y-2">
        {tocItems.map((item) => (
          <button
            key={item.id}
            onClick={() => handleClick(item.id)}
            className={`block text-left w-full text-sm transition-colors duration-200 ${
              item.level === 1 ? 'font-semibold text-gray-900' :
              item.level === 2 ? 'pl-4 text-gray-700' :
              'pl-8 text-gray-600'
            } ${
              activeId === item.id 
                ? 'text-blue-600 font-semibold bg-blue-50 px-2 py-1 rounded' 
                : 'hover:text-blue-600'
            }`}
          >
            {item.text}
          </button>
        ))}
      </nav>

      {/* 진행률 표시 */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
          <span>읽기 진행률</span>
          <span>{Math.round((tocItems.findIndex(item => item.id === activeId) + 1) / tocItems.length * 100)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ 
              width: `${(tocItems.findIndex(item => item.id === activeId) + 1) / tocItems.length * 100}%` 
            }}
          />
        </div>
      </div>
    </div>
  );
}