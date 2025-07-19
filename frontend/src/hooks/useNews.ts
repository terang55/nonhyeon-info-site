/**
 * 뉴스 데이터 관리를 위한 커스텀 훅
 */

import { useState, useCallback } from 'react';
import { NewsItem, ApiResponse } from '@/types/news';

interface UseNewsReturn {
  news: NewsItem[];
  loading: boolean;
  loadingMore: boolean;
  error: string | null;
  hasMore: boolean;
  fetchNews: () => Promise<void>;
  loadMore: () => Promise<void>;
  setNews: (news: NewsItem[]) => void;
  setError: (error: string | null) => void;
}

export function useNews(selectedCategory: string): UseNewsReturn {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const itemsPerPage = 20;

  const fetchNews = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setCurrentPage(1);
      setHasMore(true);
      
      const params = new URLSearchParams();
      if (selectedCategory !== '전체' && selectedCategory !== '병원' && selectedCategory !== '약국' && selectedCategory !== '학원') {
        params.append('category', selectedCategory);
      }
      params.append('limit', itemsPerPage.toString());
      params.append('page', '1');

      const response = await fetch(`/api/news?${params.toString()}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      const result: ApiResponse = await response.json();

      if (result.success) {
        setNews(result.data);
        setHasMore(result.data.length === itemsPerPage);
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
  }, [selectedCategory, itemsPerPage]);

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;

    try {
      setLoadingMore(true);
      setError(null);
      
      const nextPage = currentPage + 1;
      const params = new URLSearchParams();
      if (selectedCategory !== '전체' && selectedCategory !== '병원' && selectedCategory !== '약국' && selectedCategory !== '학원') {
        params.append('category', selectedCategory);
      }
      params.append('limit', itemsPerPage.toString());
      params.append('page', nextPage.toString());

      const response = await fetch(`/api/news?${params.toString()}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      const result: ApiResponse = await response.json();

      if (result.success) {
        const newItems = result.data.filter(
          newItem => !news.some(existingItem => existingItem.url === newItem.url)
        );
        
        if (newItems.length > 0) {
          setNews(prevNews => [...prevNews, ...newItems]);
          setCurrentPage(nextPage);
        }
        
        setHasMore(result.data.length === itemsPerPage && newItems.length > 0);
      } else {
        setError('추가 데이터를 불러오는데 실패했습니다.');
      }
    } catch (error) {
      console.error('Error loading more news:', error);
      setError('네트워크 오류가 발생했습니다.');
    } finally {
      setLoadingMore(false);
    }
  }, [selectedCategory, currentPage, itemsPerPage, loadingMore, hasMore, news]);

  return {
    news,
    loading,
    loadingMore,
    error,
    hasMore,
    fetchNews,
    loadMore,
    setNews,
    setError,
  };
}