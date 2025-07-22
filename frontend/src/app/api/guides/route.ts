import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { GuideContent } from '@/types/guide';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const slug = searchParams.get('slug');

    const guidesDirectory = path.join(process.cwd(), 'public', 'guides');

    // 단일 가이드 요청
    if (category && slug) {
      const filePath = path.join(guidesDirectory, category, `${slug}.md`);
      
      if (!fs.existsSync(filePath)) {
        return NextResponse.json({ error: 'Guide not found' }, { status: 404 });
      }

      const fileContents = fs.readFileSync(filePath, 'utf8');
      const { data: frontMatter, content } = matter(fileContents);

      const guideData: GuideContent = {
        title: frontMatter.title || '제목 없음',
        slug,
        description: frontMatter.description || '',
        category,
        keywords: frontMatter.keywords || [],
        tags: frontMatter.tags || [],
        featured: frontMatter.featured || false,
        difficulty: frontMatter.difficulty || 'medium',
        readingTime: frontMatter.readingTime || Math.ceil(content.length / 1000 * 3), // 대략적인 읽기 시간 계산
        lastUpdated: frontMatter.lastUpdated || new Date().toISOString().split('T')[0],
        content: '', // HTML 변환은 클라이언트에서 처리
        rawContent: content,
        relatedGuides: frontMatter.relatedGuides || [],
        author: frontMatter.author,
        views: frontMatter.views || 0,
        likes: frontMatter.likes || 0
      };

      return NextResponse.json(guideData);
    }

    // 모든 가이드 목록 요청
    const guides: GuideContent[] = [];

    function scanDirectory(dir: string) {
      if (!fs.existsSync(dir)) return;

      const items = fs.readdirSync(dir);

      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
          scanDirectory(fullPath);
        } else if (item.endsWith('.md')) {
          try {
            const fileContents = fs.readFileSync(fullPath, 'utf8');
            const { data: frontMatter, content } = matter(fileContents);
            
            const slug = item.replace('.md', '');
            const relativePath = path.relative(guidesDirectory, fullPath);
            const pathParts = relativePath.split(path.sep);
            const actualCategory = pathParts[0];

            const guideData: GuideContent = {
              title: frontMatter.title || '제목 없음',
              slug,
              description: frontMatter.description || '',
              category: actualCategory,
              keywords: frontMatter.keywords || [],
              tags: frontMatter.tags || [],
              featured: frontMatter.featured || false,
              difficulty: frontMatter.difficulty || 'medium',
              readingTime: frontMatter.readingTime || Math.ceil(content.length / 1000 * 3),
              lastUpdated: frontMatter.lastUpdated || new Date().toISOString().split('T')[0],
              content: '',
              rawContent: content,
              relatedGuides: frontMatter.relatedGuides || []
            };
            
            guides.push(guideData);
          } catch (error) {
            console.error(`Error processing ${fullPath}:`, error);
          }
        }
      }
    }

    scanDirectory(guidesDirectory);

    // 카테고리별 필터링
    const filteredGuides = category 
      ? guides.filter(guide => guide.category === category)
      : guides;

    return NextResponse.json({
      guides: filteredGuides,
      total: filteredGuides.length
    });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}