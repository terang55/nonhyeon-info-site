import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { getGuideBySlug, getRelatedGuides, generateGuideMetadata, getCategoryInfo } from '@/lib/guide-utils';
import type { GuideContent } from '@/types/guide';
import Script from 'next/script';
import TableOfContents from '@/components/TableOfContents';
import { getGuideTableOfContents } from '@/lib/guide-toc';

interface Props {
  params: Promise<{ category: string; slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const guide = getGuideBySlug(slug);
  
  if (!guide) {
    return {
      title: '가이드를 찾을 수 없습니다 | 논현동 정보'
    };
  }

  const metadata = generateGuideMetadata(guide);
  
  return {
    title: metadata.title,
    description: metadata.description,
    keywords: metadata.keywords,
    alternates: {
      canonical: metadata.canonicalUrl,
    },
    openGraph: {
      title: metadata.openGraph.title,
      description: metadata.openGraph.description,
      url: metadata.canonicalUrl,
      siteName: '논현동 정보',
      images: [
        {
          url: metadata.openGraph.image,
          width: 1200,
          height: 630,
          alt: guide.title
        }
      ],
      locale: 'ko_KR',
      type: 'article'
    },
    twitter: {
      card: 'summary_large_image',
      title: metadata.openGraph.title,
      description: metadata.openGraph.description,
      images: [metadata.openGraph.image]
    }
  };
}

export default async function GuidePage({ params }: Props) {
  const { category, slug } = await params;
  
  // 서버 컴포넌트에서 안전한 가이드 로딩
  let guide: GuideContent | null = null;
  try {
    console.log(`🎯 [GuidePage] 시작: ${category}/${slug}`);
    
    const { loadGuideContentSync } = await import('@/lib/server-markdown-loader');
    const staticGuide = getGuideBySlug(slug);
    
    console.log(`📋 [GuidePage] Static guide:`, staticGuide ? '찾음' : '없음');
    
    if (!staticGuide) {
      console.log(`❌ [GuidePage] Static guide not found: ${slug}`);
      notFound();
    }
    
    console.log(`🏷️ [GuidePage] 카테고리 확인: ${staticGuide.category} vs ${category}`);
    
    // 카테고리 검증
    if (staticGuide.category !== category) {
      console.log(`❌ [GuidePage] Category mismatch`);
      notFound();
    }
    
    console.log(`📂 [GuidePage] 마크다운 로딩 시도...`);
    
    // 서버에서 실제 콘텐츠 로드
    const loadedGuide = loadGuideContentSync(slug, staticGuide.category);
    
    console.log(`📄 [GuidePage] Loaded guide:`, loadedGuide ? '성공' : '실패');
    
    if (loadedGuide) {
      guide = {
        ...staticGuide,
        title: loadedGuide.title || staticGuide.title,
        description: loadedGuide.description || staticGuide.description,
        content: loadedGuide.content,
        rawContent: loadedGuide.rawContent,
        keywords: loadedGuide.keywords?.length ? loadedGuide.keywords : staticGuide.keywords || [],
        tags: loadedGuide.tags?.length ? loadedGuide.tags : staticGuide.tags || [],
        relatedGuides: loadedGuide.relatedGuides?.length ? loadedGuide.relatedGuides : staticGuide.relatedGuides || [],
        readingTime: loadedGuide.readingTime || staticGuide.readingTime,
        difficulty: loadedGuide.difficulty || staticGuide.difficulty,
        lastUpdated: loadedGuide.lastUpdated || staticGuide.lastUpdated
      };
    } else {
      // 마크다운 파일이 없는 경우 정적 데이터로 대체
      guide = {
        ...staticGuide,
        content: '<div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6"><p class="text-yellow-800">🚧 이 가이드는 현재 작성 중입니다. 곧 완성된 내용으로 업데이트됩니다!</p></div>',
        rawContent: '가이드 작성 중입니다.'
      };
    }
  } catch (error) {
    console.error('가이드 로딩 중 오류:', error);
    notFound();
  }
  
  if (!guide) {
    notFound();
  }

  const relatedGuides = getRelatedGuides(guide);
  const categoryInfo = getCategoryInfo(guide.category);
  const metadata = generateGuideMetadata(guide);
  const tocItems = getGuideTableOfContents(guide.category, slug);

  return (
    <>
      <Script
        id="guide-structured-data"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(metadata.structuredData)
        }}
      />
      
      <Script
        id="guide-howto-schema"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(metadata.howToSchema)
        }}
      />

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-14 sm:h-16">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <span className="text-2xl sm:text-3xl">{categoryInfo?.icon || '📚'}</span>
                <div>
                  <Link href="/" className="text-lg sm:text-2xl font-bold text-gray-900 hover:text-blue-600 transition-colors">
                    🏠 논현동 정보
                  </Link>
                  <p className="text-xs sm:text-sm text-gray-500">논현동에서의 매일매일</p>
                </div>
              </div>
              <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <span className="text-base">📖</span>
                  <span className="text-xs">{categoryInfo?.name} 가이드</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* 네비게이션 바 */}
        <section className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row items-center justify-center py-3 sm:py-4 gap-2 sm:gap-6">
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 w-full sm:w-auto">
                <Link 
                  href="/guides" 
                  className="flex items-center space-x-2 px-4 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors min-h-[44px] w-full sm:w-auto justify-center"
                >
                  <span className="text-lg">📚</span>
                  <span className="text-sm font-medium">생활 가이드</span>
                </Link>
                <Link 
                  href="/realestate" 
                  className="flex items-center space-x-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors min-h-[44px] w-full sm:w-auto justify-center"
                >
                  <span className="text-lg">🏢</span>
                  <span className="text-sm font-medium">부동산 정보</span>
                </Link>
                <Link 
                  href="/subway" 
                  className="flex items-center space-x-2 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors min-h-[44px] w-full sm:w-auto justify-center"
                >
                  <span className="text-lg">🚇</span>
                  <span className="text-sm font-medium">실시간 교통</span>
                </Link>
              </div>
              <div className="text-xs sm:text-sm text-gray-600 text-center">
                <span className="block sm:hidden">논현동 생활 가이드 · 부동산 실거래가 · 지하철 실시간 정보</span>
                <span className="hidden sm:block">논현동 생활 가이드 · 실거래가 · 호구포역 · 인천논현역 · 소래포구역 실시간 정보</span>
              </div>
            </div>
          </div>
        </section>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* 브레드크럼 */}
          <div className="flex items-center space-x-2 text-sm text-gray-600 mb-8">
            <Link href="/" className="hover:text-blue-600">홈</Link>
            <span>›</span>
            <Link href="/guides" className="hover:text-blue-600">생활 가이드</Link>
            <span>›</span>
            <span className="text-gray-900">{categoryInfo?.name}</span>
          </div>

          {/* 가이드 헤더 */}
          <div className="bg-white rounded-xl shadow-sm border p-8 mb-8">
            <div className="flex items-center space-x-2 mb-4">
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                {categoryInfo?.name}
              </span>
              <span className="text-xs text-gray-500">
                {guide.readingTime}분 읽기
              </span>
              <span className="text-xs text-gray-500">
                {guide.difficulty === 'easy' ? '쉬움' : guide.difficulty === 'medium' ? '보통' : '어려움'}
              </span>
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {guide.title}
            </h1>
            
            <p className="text-lg text-gray-600 mb-6">
              {guide.description}
            </p>

            <div className="flex items-center justify-between">
              <div className="flex flex-wrap gap-2">
                {guide.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
              <div className="text-sm text-gray-500">
                최종 수정: {new Date(guide.lastUpdated).toLocaleDateString('ko-KR')}
              </div>
            </div>
          </div>

          {/* 메인 컨텐츠 - 2컬럼 레이아웃 */}
          <div className="lg:grid lg:grid-cols-4 lg:gap-8">
            {/* 목차 사이드바 (데스크톱) */}
            {tocItems.length > 0 && (
              <aside className="hidden lg:block lg:col-span-1">
                <TableOfContents tocItems={tocItems} />
              </aside>
            )}
            
            {/* 메인 컨텐츠 */}
            <div className={`${tocItems.length > 0 ? 'lg:col-span-3' : 'lg:col-span-4'}`}>
              {/* 목차 (모바일) */}
              {tocItems.length > 0 && (
                <div className="lg:hidden mb-8">
                  <TableOfContents tocItems={tocItems} />
                </div>
              )}
              
              {/* 가이드 내용 */}
              <div className="bg-white rounded-xl shadow-sm border mb-8 overflow-hidden">
                {/* 컨텐츠 헤더 */}
                <div className="bg-gradient-to-r from-blue-50 to-green-50 px-8 py-6 border-b">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{categoryInfo?.icon || '📚'}</span>
                      <div>
                        <h2 className="text-lg font-semibold text-gray-800">
                          {categoryInfo?.name} 가이드
                        </h2>
                        <p className="text-sm text-gray-600">
                          논현동 생활정보
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <span>📖</span>
                      <span>{guide.readingTime}분 읽기</span>
                    </div>
                  </div>
                </div>
                
                {/* 컨텐츠 본문 */}
                <div className="p-8">
                  <div 
                    className="guide-content max-w-none prose prose-lg
                      prose-headings:text-gray-900 prose-headings:font-bold
                      prose-h1:text-2xl prose-h1:border-b prose-h1:border-gray-200 prose-h1:pb-3 prose-h1:mb-6
                      prose-h2:text-xl prose-h2:mt-8 prose-h2:mb-4
                      prose-h3:text-lg prose-h3:mt-6 prose-h3:mb-3
                      prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-4
                      prose-ul:my-4 prose-ol:my-4
                      prose-li:mb-2
                      prose-strong:text-gray-900 prose-strong:font-semibold
                      prose-blockquote:border-l-4 prose-blockquote:border-blue-500 
                      prose-blockquote:bg-blue-50 prose-blockquote:p-4 prose-blockquote:my-6
                      prose-img:rounded-lg prose-img:shadow-sm"
                    dangerouslySetInnerHTML={{ __html: guide.content }}
                  />
                </div>

                {/* 컨텐츠 푸터 */}
                <div className="bg-gray-50 px-8 py-4 border-t">
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <div className="flex items-center space-x-4">
                      <span>🕐 최종 수정: {new Date(guide.lastUpdated).toLocaleDateString('ko-KR')}</span>
                      <span>📝 작성자: 논현동 정보</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors">
                        📋 복사
                      </button>
                      <button className="px-3 py-1 bg-green-100 text-green-700 rounded-full hover:bg-green-200 transition-colors">
                        📤 공유
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 관련 가이드 */}
          {relatedGuides.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                🔗 관련 가이드
              </h2>
              <div className="grid gap-4 md:grid-cols-3">
                {relatedGuides.map((relatedGuide) => (
                  <Link
                    key={relatedGuide.slug}
                    href={`/guides/${relatedGuide.category}/${relatedGuide.slug}`}
                    className="group p-4 border rounded-lg hover:shadow-sm transition-shadow"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                        {getCategoryInfo(relatedGuide.category)?.name}
                      </span>
                      <span className="text-xs text-gray-500">{relatedGuide.readingTime}분</span>
                    </div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                      {relatedGuide.title}
                    </h3>
                    <p className="text-xs text-gray-600 line-clamp-2">
                      {relatedGuide.description}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* 네비게이션 */}
          <div className="mt-8 flex justify-between items-center">
            <Link 
              href="/guides"
              className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
            >
              ← 가이드 목록으로
            </Link>
            
            <div className="text-sm text-gray-500">
              이 가이드가 도움이 되셨나요?
            </div>
          </div>
        </main>
      </div>
    </>
  );
}