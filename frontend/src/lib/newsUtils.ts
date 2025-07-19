/**
 * 뉴스 관련 유틸리티 함수들
 * 뉴스 타입별 아이콘, 라벨, 스타일 등을 관리합니다.
 */

import React from 'react';

/**
 * 뉴스 타입별 아이콘 반환
 * @param type - 뉴스 타입 ('news', 'blog', 'youtube', 'cafe')
 * @returns 해당 타입의 이모지 아이콘
 */
export function getTypeIcon(type?: string): React.ReactNode {
  switch (type) {
    case 'blog':
      return <span className="text-lg">📝</span>;
    case 'youtube':
      return <span className="text-lg">🎥</span>;
    case 'cafe':
      return <span className="text-lg">☕</span>;
    case 'news':
    default:
      return <span className="text-lg">📰</span>;
  }
}

/**
 * 뉴스 타입별 한국어 라벨 반환
 * @param type - 뉴스 타입
 * @returns 한국어 라벨
 */
export function getTypeLabel(type?: string): string {
  switch (type) {
    case 'blog':
      return '블로그';
    case 'youtube':
      return '유튜브';
    case 'cafe':
      return '카페';
    case 'news':
    default:
      return '뉴스';
  }
}

/**
 * 뉴스 타입별 배경색 클래스 반환
 * @param type - 뉴스 타입
 * @returns Tailwind CSS 클래스 문자열
 */
export function getCategoryColor(type?: string): string {
  const colors: { [key: string]: string } = {
    'news': 'bg-blue-100 text-blue-800',
    'blog': 'bg-green-100 text-green-800',
    'youtube': 'bg-red-100 text-red-800',
    'cafe': 'bg-yellow-100 text-yellow-800',
  };
  return colors[type || 'news'] || 'bg-gray-100 text-gray-800';
}

/**
 * 카테고리별 아이콘 매핑
 */
export const categoryIcons: { [key: string]: React.ReactNode } = {
  '뉴스': <span className="text-base">📰</span>,
  '블로그': <span className="text-base">📝</span>,
  '유튜브': <span className="text-base">🎥</span>,
  '병원': <span className="text-base">🏥</span>,
  '약국': <span className="text-base">💊</span>,
  '부동산': <span className="text-base">🏠</span>,
  '학원': <span className="text-base">🎓</span>,
};

/**
 * 사용 가능한 카테고리 목록
 */
export const categories = [
  '전체',
  '뉴스',
  '블로그', 
  '유튜브',
  '병원',
  '약국',
  '학원'
];

/**
 * 컨텐츠 길이에 따른 요약 생성
 * @param content - 원본 컨텐츠
 * @param maxLength - 최대 길이 (기본값: 100)
 * @returns 요약된 컨텐츠
 */
export function truncateContent(content: string, maxLength: number = 100): string {
  if (!content || content.length <= maxLength) {
    return content;
  }
  
  return content.substring(0, maxLength).trim() + '...';
}

/**
 * 키워드 하이라이팅을 위한 텍스트 처리
 * @param text - 원본 텍스트
 * @param keyword - 하이라이팅할 키워드
 * @returns 하이라이팅된 텍스트 (HTML)
 */
export function highlightKeyword(text: string, keyword?: string): string {
  if (!keyword || !text) return text;
  
  const regex = new RegExp(`(${keyword})`, 'gi');
  return text.replace(regex, '<mark class="bg-yellow-200">$1</mark>');
}

/**
 * URL에서 도메인 추출
 * @param url - 전체 URL
 * @returns 도메인 이름
 */
export function extractDomain(url: string): string {
  try {
    const domain = new URL(url).hostname;
    // www. 접두사 제거
    return domain.replace(/^www\./, '');
  } catch {
    return url;
  }
}

/**
 * YouTube 비디오 ID 추출
 * @param url - YouTube URL
 * @returns 비디오 ID 또는 null
 */
export function extractYouTubeVideoId(url: string): string | null {
  const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

/**
 * YouTube 썸네일 URL 생성
 * @param videoId - YouTube 비디오 ID
 * @param quality - 썸네일 품질 ('default', 'medium', 'high', 'standard', 'maxres')
 * @returns 썸네일 URL
 */
export function getYouTubeThumbnail(videoId: string, quality: 'default' | 'medium' | 'high' | 'standard' | 'maxres' = 'medium'): string {
  const qualityMap = {
    'default': 'default',      // 120x90
    'medium': 'mqdefault',     // 320x180
    'high': 'hqdefault',       // 480x360
    'standard': 'sddefault',   // 640x480
    'maxres': 'maxresdefault', // 1280x720
  };
  
  return `https://i.ytimg.com/vi/${videoId}/${qualityMap[quality]}.jpg`;
}

/**
 * 컨텐츠 타입별 정렬 우선순위
 * @param type - 컨텐츠 타입
 * @returns 정렬 우선순위 (낮을수록 높은 우선순위)
 */
export function getTypePriority(type?: string): number {
  const priorities: { [key: string]: number } = {
    'news': 1,    // 뉴스가 최우선
    'blog': 2,    // 블로그가 두 번째
    'youtube': 3, // 유튜브가 세 번째
    'cafe': 4,    // 카페가 마지막
  };
  
  return priorities[type || 'news'] || 5;
}

/**
 * 뉴스 아이템 검증
 * @param item - 검증할 뉴스 아이템
 * @returns 유효성 여부
 */
export function validateNewsItem(item: unknown): boolean {
  if (!item || typeof item !== 'object') return false;
  
  const newsItem = item as Record<string, unknown>;
  
  // 필수 필드 확인
  const requiredFields = ['title', 'content', 'source', 'url'];
  for (const field of requiredFields) {
    if (!newsItem[field] || typeof newsItem[field] !== 'string') {
      return false;
    }
  }
  
  // URL 형식 확인
  try {
    new URL(newsItem.url as string);
  } catch {
    return false;
  }
  
  return true;
}

/**
 * 뉴스 아이템 배열을 타입별로 그룹화
 * @param items - 뉴스 아이템 배열
 * @returns 타입별로 그룹화된 객체
 */
export function groupByType<T extends { type?: string }>(items: T[]): Record<string, T[]> {
  return items.reduce((groups, item) => {
    const type = item.type || 'news';
    if (!groups[type]) {
      groups[type] = [];
    }
    groups[type].push(item);
    return groups;
  }, {} as Record<string, T[]>);
}

/**
 * 검색어로 뉴스 필터링
 * @param items - 뉴스 아이템 배열
 * @param searchTerm - 검색어
 * @returns 필터링된 배열
 */
export function filterNewsBySearch<T extends { title: string; content: string; source: string }>(
  items: T[], 
  searchTerm: string
): T[] {
  if (!searchTerm.trim()) return items;
  
  const term = searchTerm.toLowerCase();
  return items.filter(item => 
    item.title.toLowerCase().includes(term) ||
    item.content.toLowerCase().includes(term) ||
    item.source.toLowerCase().includes(term)
  );
}