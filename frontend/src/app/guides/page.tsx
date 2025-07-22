import Link from 'next/link';
import type { Metadata } from 'next';
import { getGuidesByCategory, GUIDE_CATEGORIES } from '@/lib/guide-utils';
import { generatePageMetadata } from '@/lib/seoUtils';
import Script from 'next/script';

export async function generateMetadata(): Promise<Metadata> {
  return generatePageMetadata('guides');
}

export default function GuidesPage() {
  const featuredGuides = getGuidesByCategory().filter(guide => guide.featured);
  const recentGuides = getGuidesByCategory().slice(0, 6);

  return (
    <>
      <Script
        id="guides-ldjson"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": "논현동 생활 가이드 모음",
            "description": "인천 남동구 논현동 생활에 필요한 모든 정보를 한곳에서 확인하세요. 맛집, 부동산, 교통정보 등 실용적인 가이드를 제공합니다.",
            "url": `https://nonhyeon.life/guides`,
            "mainEntity": {
              "@type": "ItemList",
              "name": "논현동 생활 가이드 목록",
              "description": "논현동 거주자를 위한 생활 정보 가이드 모음",
              "numberOfItems": featuredGuides.length + recentGuides.length,
              "itemListElement": [
                ...featuredGuides.map((guide, index) => ({
                  "@type": "ListItem",
                  "position": index + 1,
                  "item": {
                    "@type": "Article",
                    "name": guide.title,
                    "description": guide.description,
                    "url": `https://nonhyeon.life/guides/${guide.category}/${guide.slug}`,
                    "author": {
                      "@type": "Organization",
                      "name": "논현동 정보"
                    }
                  }
                }))
              ]
            }
          })
        }}
      />

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-14 sm:h-16">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <span className="text-2xl sm:text-3xl">📚</span>
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
                  <span className="text-xs">생활 가이드</span>
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
          {/* 페이지 헤더 */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              📚 논현동 생활 가이드
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              인천 남동구 논현동에서의 생활에 필요한 모든 정보를 실용적인 가이드로 제공합니다
            </p>
          </div>

          {/* 추천 가이드 */}
          {featuredGuides.length > 0 && (
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                ⭐ 추천 가이드
              </h2>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {featuredGuides.map((guide) => (
                  <Link
                    key={guide.slug}
                    href={`/guides/${guide.category}/${guide.slug}`}
                    className="group bg-white rounded-xl shadow-sm border hover:shadow-md transition-shadow p-6"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-2xl">⭐</span>
                      <span className="text-xs text-gray-500">{guide.readingTime}분 읽기</span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                      {guide.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {guide.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex flex-wrap gap-1">
                        {guide.tags.slice(0, 2).map((tag) => (
                          <span
                            key={tag}
                            className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(guide.lastUpdated).toLocaleDateString('ko-KR')}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* 카테고리별 가이드 */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              📋 카테고리별 가이드
            </h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {GUIDE_CATEGORIES.map((category) => {
                const categoryGuides = getGuidesByCategory(category.id);
                return (
                  <div
                    key={category.id}
                    className="bg-white rounded-xl shadow-sm border p-6"
                  >
                    <div className="flex items-center mb-4">
                      <span className="text-2xl mr-3">{category.icon}</span>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {category.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {category.description}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {categoryGuides.slice(0, 3).map((guide) => (
                        <Link
                          key={guide.slug}
                          href={`/guides/${guide.category}/${guide.slug}`}
                          className="block text-sm text-gray-700 hover:text-blue-600 transition-colors"
                        >
                          • {guide.title}
                        </Link>
                      ))}
                      {categoryGuides.length > 3 && (
                        <div className="text-sm text-gray-500">
                          + {categoryGuides.length - 3}개 더
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* 최신 가이드 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              🆕 최신 가이드
            </h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {recentGuides.map((guide) => (
                <Link
                  key={guide.slug}
                  href={`/guides/${guide.category}/${guide.slug}`}
                  className="group bg-white rounded-xl shadow-sm border hover:shadow-md transition-shadow p-6"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                      {GUIDE_CATEGORIES.find(c => c.id === guide.category)?.name}
                    </span>
                    <span className="text-xs text-gray-500">{guide.readingTime}분</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {guide.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {guide.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-xs text-gray-500">
                      <span className="mr-2">📅</span>
                      {new Date(guide.lastUpdated).toLocaleDateString('ko-KR')}
                    </div>
                    <span className="text-xs text-blue-600 group-hover:text-blue-700">
                      읽기 →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </main>
      </div>
    </>
  );
}