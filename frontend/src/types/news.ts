/**
 * 뉴스 아이템 관련 타입 정의
 */

export interface NewsItem {
  title: string;
  url: string;
  description?: string;
  content: string;
  date: string;
  source: string;
  platform?: string;
  type?: 'news' | 'blog' | 'youtube' | 'cafe';
  keyword: string;
  content_length: number;
  summary?: string;
  image?: string;
  author?: string;
  category?: string;
  
  // YouTube 전용 필드
  channel?: string;
  views?: string;
  upload_time?: string;
  thumbnail?: string;
}

export interface ApiResponse {
  success: boolean;
  data: NewsItem[];
  total: number;
  totalItems?: number;
  page?: number;
  limit?: number;
  hasMore?: boolean;
  timestamp: string;
  note?: string;
}

export interface SyncStatus {
  lastSync: string | null;
  totalFiles: number;
  keywords: string[];
  files: { [key: string]: string };
  status: 'synced' | 'never_synced';
}

export interface StatsData {
  totalArticles: number;
  avgContentLength: number;
  lastUpdated: string;
  summary: {
    newsCount: number;
    blogCount: number;
    totalSources: number;
    totalCategories: number;
  };
}

export interface NewsResponse {
  success: boolean;
  data: NewsItem[];
  total?: number;
  timestamp: string;
  note?: string;
}

export interface NewsStats {
  total: number;
  by_type: Record<string, number>;
  by_source: Record<string, number>;
  latest_update: string;
}