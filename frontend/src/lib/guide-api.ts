import { GuideMetadata } from './server-markdown-loader';

/**
 * 클라이언트 사이드에서 가이드 데이터를 가져오는 API 함수들
 */

export async function fetchGuideContent(category: string, slug: string): Promise<string | null> {
  try {
    const response = await fetch(`/api/guides/${category}/${slug}`);
    if (!response.ok) {
      return null;
    }
    const data = await response.json();
    return data.content || null;
  } catch (error) {
    console.error('가이드 콘텐츠 가져오기 실패:', error);
    return null;
  }
}

export async function fetchGuideMetadata(category: string, slug: string): Promise<GuideMetadata | null> {
  try {
    const response = await fetch(`/api/guides/${category}/${slug}`);
    if (!response.ok) {
      return null;
    }
    const data = await response.json();
    return data.metadata || null;
  } catch (error) {
    console.error('가이드 메타데이터 가져오기 실패:', error);
    return null;
  }
}

export async function fetchGuidesByCategory(category: string): Promise<GuideMetadata[]> {
  try {
    const response = await fetch(`/api/guides/${category}`);
    if (!response.ok) {
      return [];
    }
    const data = await response.json();
    return data.guides || [];
  } catch (error) {
    console.error('카테고리 가이드 목록 가져오기 실패:', error);
    return [];
  }
}