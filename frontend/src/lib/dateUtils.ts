/**
 * 날짜 관련 유틸리티 함수들
 * 다양한 날짜 형식을 파싱하고 포맷팅하는 기능을 제공합니다.
 */

import { NewsItem } from '@/types/news';

/**
 * 뉴스 항목의 날짜를 한국어 형식으로 포맷팅
 * @param dateString - 원본 날짜 문자열
 * @param item - 뉴스 항목 (타입별 처리를 위해)
 * @returns 포맷된 날짜 문자열
 */
export function formatDate(dateString: string, item?: NewsItem): string {
  // 유튜브 영상이고 날짜가 없는 경우
  if (item?.type === 'youtube' && (!dateString || dateString.trim() === '')) {
    return '유튜브 영상';
  }
  
  // 블로그 글이고 날짜가 없는 경우
  if (item?.type === 'blog' && (!dateString || dateString.trim() === '')) {
    // 네이버 블로그 URL에서 날짜 추출 시도
    if (item.url && item.url.includes('blog.naver.com')) {
      // 네이버 블로그 포스트 ID는 보통 시간 기반으로 생성되지만
      // 정확한 날짜 추출은 어려우므로 "블로그 글"로 표시
      return '블로그 글';
    }
    return '블로그 글';
  }
  
  if (!dateString || dateString.trim() === '') return '날짜 없음';
  
  try {
    // 한국어 날짜 형식 파싱: "2025.06.25. 오후 3:54"
    const koreanDateMatch = dateString.match(/(\d{4})\.(\d{1,2})\.(\d{1,2})\.\s*(오전|오후)\s*(\d{1,2}):(\d{2})/);
    
    if (koreanDateMatch) {
      const [, year, month, day, ampm, hour, minute] = koreanDateMatch;
      let hour24 = parseInt(hour);
      
      // 오후인 경우 12시간 추가 (단, 12시는 그대로)
      if (ampm === '오후' && hour24 !== 12) {
        hour24 += 12;
      }
      // 오전 12시는 0시로 변환
      if (ampm === '오전' && hour24 === 12) {
        hour24 = 0;
      }
      
      const parsedDate = new Date(
        parseInt(year),
        parseInt(month) - 1, // JavaScript의 월은 0부터 시작
        parseInt(day),
        hour24,
        parseInt(minute)
      );
      
      return parsedDate.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
    
    // 표준 ISO 날짜 형식도 시도
    const date = new Date(dateString);
    if (!isNaN(date.getTime())) {
      return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
    
    // 파싱 실패시 원본 반환
    return dateString;
  } catch {
    return dateString;
  }
}

/**
 * 상대적 시간 표시 (예: "2시간 전", "3일 전")
 * @param dateString - 날짜 문자열
 * @returns 상대적 시간 문자열
 */
export function formatRelativeTime(dateString: string): string {
  if (!dateString || dateString.trim() === '') return '시간 불명';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffMinutes < 1) return '방금 전';
    if (diffMinutes < 60) return `${diffMinutes}분 전`;
    if (diffHours < 24) return `${diffHours}시간 전`;
    if (diffDays < 7) return `${diffDays}일 전`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}주 전`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)}개월 전`;
    
    return `${Math.floor(diffDays / 365)}년 전`;
  } catch {
    return dateString;
  }
}

/**
 * 날짜가 유효한지 확인
 * @param dateString - 확인할 날짜 문자열
 * @returns 유효성 여부
 */
export function isValidDate(dateString: string): boolean {
  if (!dateString || dateString.trim() === '') return false;
  
  try {
    const date = new Date(dateString);
    return !isNaN(date.getTime());
  } catch {
    return false;
  }
}

/**
 * 날짜를 YYYY-MM-DD 형식으로 변환
 * @param date - Date 객체 또는 날짜 문자열
 * @returns YYYY-MM-DD 형식 문자열
 */
export function formatDateToISO(date: Date | string): string {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return '';
    
    return dateObj.toISOString().split('T')[0];
  } catch {
    return '';
  }
}

/**
 * 한국 시간대 기준으로 현재 날짜 문자열 반환
 * @returns YYYY-MM-DD 형식의 한국 시간 기준 날짜
 */
export function getTodayKST(): string {
  const now = new Date();
  const kstTime = new Date(now.getTime() + (9 * 60 * 60 * 1000)); // UTC + 9시간
  return formatDateToISO(kstTime);
}

/**
 * 한국 시간대 기준으로 어제 날짜 문자열 반환
 * @returns YYYY-MM-DD 형식의 한국 시간 기준 어제 날짜
 */
export function getYesterdayKST(): string {
  const now = new Date();
  const kstTime = new Date(now.getTime() + (9 * 60 * 60 * 1000)); // UTC + 9시간
  kstTime.setDate(kstTime.getDate() - 1); // 어제
  return formatDateToISO(kstTime);
}