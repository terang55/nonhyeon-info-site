/**
 * 카테고리 필터 로직을 위한 커스텀 훅
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { categories } from '@/lib/newsUtils';

interface UseCategoryReturn {
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  handleCategoryChange: (category: string) => void;
}

export function useCategory(): UseCategoryReturn {
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const router = useRouter();

  // URL 파라미터에서 카테고리 읽기
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const categoryParam = urlParams.get('category');
    if (categoryParam && categories.includes(categoryParam)) {
      setSelectedCategory(categoryParam);
    }
  }, []);

  const handleCategoryChange = (category: string) => {
    if (category === '학원') {
      router.push('/academy');
    } else {
      setSelectedCategory(category);
      // URL 파라미터 업데이트
      const newUrl = category === '전체' ? '/' : `/?category=${encodeURIComponent(category)}`;
      window.history.pushState({}, '', newUrl);
    }
  };

  return {
    selectedCategory,
    setSelectedCategory,
    handleCategoryChange,
  };
}