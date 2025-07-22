import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { marked } from 'marked';

export interface GuideMetadata {
  title?: string;
  description?: string;
  keywords?: string[];
  tags?: string[];
  featured?: boolean;
  difficulty?: 'easy' | 'medium' | 'hard';
  readingTime?: number;
  lastUpdated?: string;
  relatedGuides?: string[];
  [key: string]: unknown;
}

export interface LoadedGuide {
  title: string;
  description: string;
  content: string;
  rawContent: string;
  keywords: string[];
  tags: string[];
  featured: boolean;
  difficulty: 'easy' | 'medium' | 'hard';
  readingTime: number;
  lastUpdated: string;
  relatedGuides: string[];
}

/**
 * 서버에서 마크다운 파일을 동기적으로 로드
 */
export function loadGuideContentSync(slug: string, category: string): LoadedGuide | null {
  try {
    console.log(`🔍 [loadGuideContentSync] Starting: ${slug}, ${category}`);
    
    const publicDir = path.join(process.cwd(), 'public');
    const filePath = path.join(publicDir, 'guides', category, `${slug}.md`);
    
    console.log(`📂 [loadGuideContentSync] File path: ${filePath}`);
    console.log(`✅ [loadGuideContentSync] File exists: ${fs.existsSync(filePath)}`);
    
    if (!fs.existsSync(filePath)) {
      console.log(`❌ 마크다운 파일을 찾을 수 없습니다: ${filePath}`);
      return null;
    }
    
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const { data: frontMatter, content: rawContent } = matter(fileContent);
    
    // 마크다운을 HTML로 변환 (간단한 방식)
    console.log(`🔄 [loadGuideContentSync] Converting markdown to HTML...`);
    
    // 기본 설정으로 마크다운 변환
    const htmlContent = marked.parse(rawContent, {
      breaks: true,
      gfm: true
    }) as string;
    
    console.log(`✅ [loadGuideContentSync] HTML conversion complete: ${htmlContent.length} chars`);
    
    // 읽기 시간 계산 (대략 분당 200단어)
    const wordCount = rawContent.split(/\s+/).length;
    const calculatedReadingTime = Math.ceil(wordCount / 200);
    
    const loadedGuide: LoadedGuide = {
      title: frontMatter.title || '제목 없음',
      description: frontMatter.description || '',
      content: htmlContent,
      rawContent,
      keywords: Array.isArray(frontMatter.keywords) ? frontMatter.keywords : [],
      tags: Array.isArray(frontMatter.tags) ? frontMatter.tags : [],
      featured: Boolean(frontMatter.featured),
      difficulty: frontMatter.difficulty === 'easy' || frontMatter.difficulty === 'medium' || frontMatter.difficulty === 'hard' 
        ? frontMatter.difficulty 
        : 'medium',
      readingTime: frontMatter.readingTime || calculatedReadingTime,
      lastUpdated: frontMatter.lastUpdated || new Date().toISOString().split('T')[0],
      relatedGuides: Array.isArray(frontMatter.relatedGuides) ? frontMatter.relatedGuides : []
    };
    
    console.log(`✅ [loadGuideContentSync] 가이드 로드 성공: ${slug} (${loadedGuide.readingTime}분 읽기)`);
    console.log(`📄 [loadGuideContentSync] Content length: ${loadedGuide.content.length}`);
    return loadedGuide;
    
  } catch (error) {
    console.error(`❌ [loadGuideContentSync] 가이드 로드 실패: ${slug}`, error);
    return null;
  }
}

/**
 * 모든 가이드의 메타데이터 로드
 */
export function loadAllGuidesMetadata(): GuideMetadata[] {
  try {
    const publicDir = path.join(process.cwd(), 'public');
    const guidesDir = path.join(publicDir, 'guides');
    
    if (!fs.existsSync(guidesDir)) {
      console.log('❌ 가이드 디렉토리를 찾을 수 없습니다');
      return [];
    }
    
    const guides: GuideMetadata[] = [];
    
    // 카테고리 디렉토리 순회
    const categories = fs.readdirSync(guidesDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);
    
    for (const category of categories) {
      const categoryPath = path.join(guidesDir, category);
      const files = fs.readdirSync(categoryPath)
        .filter(file => file.endsWith('.md'));
      
      for (const file of files) {
        const filePath = path.join(categoryPath, file);
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const { data: frontMatter } = matter(fileContent);
        
        const slug = file.replace('.md', '');
        guides.push({
          ...frontMatter,
          slug,
          category
        });
      }
    }
    
    console.log(`✅ ${guides.length}개 가이드 메타데이터 로드 완료`);
    return guides;
    
  } catch (error) {
    console.error('❌ 가이드 메타데이터 로드 실패:', error);
    return [];
  }
}