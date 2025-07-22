import fs from 'fs';
import path from 'path';
import { TocItem } from '@/types/guide';

/**
 * 마크다운 텍스트에서 목차를 생성하는 유틸리티
 */
export function generateTableOfContents(markdownContent: string): TocItem[] {
  const lines = markdownContent.split('\n');
  const tocItems: TocItem[] = [];
  
  for (const line of lines) {
    // 헤딩 라인 감지 (# ## ### 등)
    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const text = headingMatch[2].trim();
      const id = text.toLowerCase()
        .replace(/[^\w\s가-힣]/g, '')
        .replace(/\s+/g, '-')
        .trim();
      
      // 레벨 3 이하만 목차에 포함 (너무 깊은 헤딩 제외)
      if (level <= 3) {
        tocItems.push({
          id,
          text,
          level
        });
      }
    }
  }
  
  return tocItems;
}

/**
 * 가이드 슬러그로부터 목차 정보 생성
 */
export function getGuideTableOfContents(category: string, slug: string): TocItem[] {
  try {
    const publicDir = path.join(process.cwd(), 'public');
    const filePath = path.join(publicDir, 'guides', category, `${slug}.md`);
    
    // 파일이 존재하지 않으면 빈 배열 반환
    if (!fs.existsSync(filePath)) {
      return [];
    }
    
    // 마크다운 파일 읽기
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    
    // Front matter 제거하고 본문만 추출
    const contentWithoutFrontmatter = fileContent.replace(/^---[\s\S]*?---\n/, '');
    
    // 목차 생성
    return generateTableOfContents(contentWithoutFrontmatter);
    
  } catch (error) {
    console.error('목차 생성 중 오류:', error);
    return [];
  }
}