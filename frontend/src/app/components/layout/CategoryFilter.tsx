/**
 * 카테고리 필터 컴포넌트
 */

import React from 'react';
import { categories, categoryIcons } from '@/lib/newsUtils';

interface CategoryFilterProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

export default function CategoryFilter({ selectedCategory, onCategoryChange }: CategoryFilterProps) {
  return (
    <section className="bg-white py-5 sm:py-6 border-b">
      <div className="max-w-7xl mx-auto px-6 sm:px-6 lg:px-8">
        <div className="flex justify-center">
          {/* Category Filter */}
          <div className="flex flex-wrap gap-3 sm:gap-3 justify-center max-w-4xl">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => onCategoryChange(category)}
                className={`px-5 sm:px-5 py-3 sm:py-3 rounded-full text-sm sm:text-base font-medium transition-all duration-200 min-h-[48px] min-w-[48px] touch-target ${
                  selectedCategory === category
                    ? 'bg-blue-600 text-white shadow-lg transform scale-105'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200 hover:shadow-md'
                }`}
              >
                <div className="flex items-center space-x-2">
                  {category !== '전체' && categoryIcons[category as keyof typeof categoryIcons]}
                  <span>{category}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}