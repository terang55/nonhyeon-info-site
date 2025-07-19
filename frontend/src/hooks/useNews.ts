/**
 * 뉴스 데이터 관리를 위한 커스텀 훅
 */

import { useState, useCallback } from 'react';
import { NewsItem, ApiResponse } from '@/types/news';

interface UseNewsReturn {
  news: NewsItem[];
  loading: boolean;
  error: string | null;
  fetchNews: () => Promise<void>;
  setNews: (news: NewsItem[]) => void;
  setError: (error: string | null) => void;
}

export function useNews(selectedCategory: string): UseNewsReturn {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNews = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      if (selectedCategory !== '전체' && selectedCategory !== '병원' && selectedCategory !== '약국' && selectedCategory !== '학원') {
        params.append('category', selectedCategory);
      }
      params.append('limit', '100');

      const response = await fetch(`/api/news?${params.toString()}`, {
        cache: 'no-store', // 항상 최신 데이터 가져오기
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      const result: ApiResponse = await response.json();

      if (result.success) {
        setNews(result.data);
        if (result.note) {
          console.log('API Note:', result.note);
        }
      } else {
        setError('데이터를 불러오는데 실패했습니다.');
      }
    } catch (error) {
      console.error('Error fetching news:', error);
      setError('네트워크 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }, [selectedCategory]);

  return {
    news,
    loading,
    error,
    fetchNews,
    setNews,
    setError,
  };
}