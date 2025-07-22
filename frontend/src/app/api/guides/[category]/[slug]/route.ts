import { NextRequest, NextResponse } from 'next/server';
import { loadGuideContentSync } from '@/lib/server-markdown-loader';
import { getGuideBySlug, generateGuideMetadata } from '@/lib/guide-utils';

interface Props {
  params: Promise<{
    category: string;
    slug: string;
  }>;
}

export async function GET(request: NextRequest, { params }: Props) {
  try {
    const { category, slug } = await params;
    
    // 정적 가이드 데이터에서 기본 정보 가져오기
    const staticGuide = getGuideBySlug(slug);
    if (!staticGuide) {
      return NextResponse.json(
        { error: 'Guide not found' }, 
        { status: 404 }
      );
    }
    
    // 서버에서 실제 마크다운 콘텐츠 로드
    const loadedGuide = loadGuideContentSync(slug, category);
    
    if (!loadedGuide) {
      // 마크다운 파일이 없어도 정적 데이터는 반환
      console.log(`⚠️ 마크다운 파일 없음, 정적 데이터 반환: ${slug}`);
      return NextResponse.json({
        ...staticGuide,
        content: '<div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6"><p class="text-yellow-800">🚧 이 가이드는 현재 작성 중입니다. 곧 완성된 내용으로 업데이트됩니다!</p></div>',
        rawContent: '가이드 작성 중입니다.'
      });
    }
    
    // 병합된 가이드 데이터 생성
    const mergedGuide = {
      ...staticGuide,
      title: loadedGuide.title || staticGuide.title,
      description: loadedGuide.description || staticGuide.description,
      content: loadedGuide.content,
      rawContent: loadedGuide.rawContent,
      keywords: loadedGuide.keywords.length ? loadedGuide.keywords : staticGuide.keywords,
      tags: loadedGuide.tags.length ? loadedGuide.tags : staticGuide.tags,
      relatedGuides: loadedGuide.relatedGuides.length ? loadedGuide.relatedGuides : staticGuide.relatedGuides,
      readingTime: loadedGuide.readingTime || staticGuide.readingTime,
      difficulty: loadedGuide.difficulty || staticGuide.difficulty,
      lastUpdated: loadedGuide.lastUpdated || staticGuide.lastUpdated,
      featured: loadedGuide.featured !== undefined ? loadedGuide.featured : staticGuide.featured
    };
    
    // 메타데이터 생성
    const metadata = generateGuideMetadata(mergedGuide);
    
    return NextResponse.json({
      ...mergedGuide,
      metadata
    });
    
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}