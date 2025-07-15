import Link from 'next/link';
import type { Metadata } from 'next';
import { BASE_URL } from '@/lib/siteConfig';
import Footer from '../components/Footer';
import { generateBreadcrumbSchema } from '@/lib/seo';
import RealEstateClientPage from './RealEstateClientPage';
import Head from 'next/head';

export const metadata: Metadata = {
  title: '인천논현동 부동산 실거래가 | 에코메트로·논현센트럴뷰 아파트 시세 | 인천논현라이프',
  description: '인천시 남동구 논현동 아파트(에코메트로·논현센트럴뷰 등) 최근 3개월 실거래가, 평당가, 거래건수 통계를 실시간으로 확인하세요. 매매·전세·월세 가격 비교 및 시장 동향 분석.',
  keywords: [
    '인천논현동 부동산', '인천논현동 아파트', '인천논현동 실거래가', '에코메트로', '논현센트럴뷰', 
    '인천논현 아파트 매매', '평당가', '부동산 가격', '국토부 실거래', '남동구 부동산',
    '아파트 시세', '매매 가격', '전세 가격', '월세 정보', '부동산 시장', '논현지구 아파트',
    '인천 부동산', '아파트 매매', '주택 가격', '부동산 투자', '인천논현동 시세',
    '남동구 논현동 부동산', '인천시 남동구 논현동', '남동구 논현동 아파트'
  ],
  openGraph: {
    title: '인천논현동 부동산 실거래가 | 에코메트로·논현센트럴뷰 아파트 시세',
    description: '인천논현동 주요 단지 실거래가, 평당가, 거래 통계를 실시간 제공. 매매·전세·월세 가격 비교 및 시장 동향 분석.',
    url: `${BASE_URL}/realestate`,
    type: 'website',
    siteName: '인천논현라이프',
    images: [
      {
        url: `${BASE_URL}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: '논현동 부동산 실거래가 정보 - 인천논현라이프'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: '인천논현동 부동산 실거래가 | 에코메트로·논현센트럴뷰 아파트 시세',
    description: '인천논현동 주요 단지 실거래가, 평당가, 거래 통계를 실시간 제공.',
    images: [`${BASE_URL}/og-image.jpg`]
  },
  alternates: { canonical: `${BASE_URL}/realestate` },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  other: {
    'geo.region': 'KR-28',
    'geo.placename': '인천광역시 남동구 논현동',
    'geo.position': '37.3894;126.7317',
    'ICBM': '37.3894, 126.7317',
  },
};

export default function RealEstatePage() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name: '인천논현동 아파트 실거래가',
    description: '국토교통부 실거래가 공개시스템 기반 최신 3개월 데이터',
    url: `${BASE_URL}/realestate`,
    keywords: ['논현동 실거래가','에코메트로','논현센트럴뷰'],
    creator: { '@type': 'Organization', name: '인천논현라이프' },
    license: 'https://www.law.go.kr'
  };

  const breadcrumbData = generateBreadcrumbSchema([
    { name: '홈', path: '/' },
    { name: '부동산', path: '/realestate' }
  ]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbData) }} />
      </Head>
      {/* 헤더 */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {/* 로고 및 제목 */}
            <div className="flex items-center space-x-3">
              <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
                <span className="text-2xl">🏙️</span>
                <div>
                  <div className="text-xl font-bold text-gray-900">인천논현라이프</div>
                  <div className="text-sm text-gray-500">부동산 정보</div>
                </div>
              </Link>
            </div>
            
            {/* 네비게이션 */}
            <nav className="hidden sm:flex items-center space-x-6">
              <Link 
                href="/" 
                className="text-gray-600 hover:text-blue-600 transition-colors font-medium"
              >
                🏠 홈
              </Link>
              <Link 
                href="/realestate" 
                className="text-blue-600 font-medium border-b-2 border-blue-600 pb-1"
              >
                🏢 부동산
              </Link>
              <Link 
                href="/subway" 
                className="text-gray-600 hover:text-blue-600 transition-colors font-medium"
              >
                🚇 실시간 교통
              </Link>
            </nav>

            {/* 모바일 네비게이션 */}
            <div className="sm:hidden flex items-center space-x-4">
              <Link 
                href="/" 
                className="text-gray-600 hover:text-blue-600 transition-colors"
              >
                🏠
              </Link>
              <Link 
                href="/subway" 
                className="text-gray-600 hover:text-blue-600 transition-colors"
              >
                🚇
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 페이지 제목 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🏢 인천논현동 부동산 실거래가
          </h1>
          <p className="text-gray-600">
            인천시 남동구 논현동 아파트 실거래가 정보를 실시간으로 확인하세요.
          </p>
        </div>

        {/* 부동산 위젯 (전체 너비로 확장) */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <RealEstateClientPage />
        </div>

        {/* 추가 정보 섹션 */}
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {/* 현재 운행 노선 */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              ✅ 현재 운행 노선
            </h2>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="font-semibold text-blue-800 mb-2 flex items-center">
                  🚄 수인분당선
                </h3>
                <div className="text-sm text-gray-700 space-y-2">
                  <div>
                    <span className="font-medium">북쪽 방향:</span> 왕십리 → 건대입구 → 선릉 → 판교 → 수원
                  </div>
                  <div>
                    <span className="font-medium">남쪽 방향:</span> 인천 → 월곶 → 소래포구 → 오이도
                  </div>
                  <div className="mt-3 p-2 bg-blue-100 rounded text-xs">
                    <div className="font-medium text-blue-900 mb-1">주요 환승역</div>
                    <div className="text-blue-800 space-y-1">
                      <div>• 왕십리: 2호선, 5호선, 중앙선</div>
                      <div>• 건대입구: 2호선, 7호선</div>
                      <div>• 선릉: 2호선, 분당선</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <h4 className="font-medium text-gray-800 mb-2">운행 정보</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <div>• <span className="font-medium">운행시간:</span> 05:30 ~ 24:00</div>
                  <div>• <span className="font-medium">배차간격:</span> 평일 5-10분, 주말 10-15분</div>
                  <div>• <span className="font-medium">왕십리까지:</span> 약 90분</div>
                </div>
              </div>

              <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                <h3 className="font-semibold text-red-800 mb-2 flex items-center">
                  🚌 광역급행버스
                </h3>
                <div className="space-y-3">
                  <div className="p-2 bg-red-100 rounded">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-red-900">M6410</span>
                      <span className="text-xs bg-red-200 text-red-700 px-2 py-1 rounded">운행중</span>
                    </div>
                    <div className="text-xs text-gray-700 space-y-1">
                      <div>• 논현동(사리울중학교) → 강남역·양재역</div>
                      <div>• 소요시간: 약 1시간</div>
                    </div>
                  </div>
                  <div className="p-2 bg-red-100 rounded">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-red-900">M6461</span>
                      <span className="text-xs bg-red-200 text-red-700 px-2 py-1 rounded">운행중</span>
                    </div>
                    <div className="text-xs text-gray-700 space-y-1">
                      <div>• 논현동(소래포구역) → 서울 강남권 직행</div>
                      <div>• 역삼역까지 직행 운행</div>
                      <div>• 기존 M6410 수요 분산 효과</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 미래 운행 노선 */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              🚀 미래 운행 노선
            </h2>
            <div className="space-y-3">
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-semibold text-blue-800">경강선 (송도~강릉)</h4>
                  <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">2028년</span>
                </div>
                <div className="text-xs text-gray-600 space-y-1">
                  <div>• 인천논현역 정차 추진 중!</div>
                  <div>• 판교 40분, 광명KTX 15분</div>
                  <div>• 판교테크노밸리 직행</div>
                </div>
              </div>

              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-semibold text-green-800">인천발 KTX</h4>
                  <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded">2026년</span>
                </div>
                <div className="text-xs text-gray-600 space-y-1">
                  <div>• 송도역서 전국 KTX 이용</div>
                  <div>• 부산 2시간30분, 목포 2시간10분</div>
                  <div>• 수인분당선 연계</div>
                </div>
              </div>

              <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-semibold text-purple-800">제2경인선</h4>
                  <span className="text-xs bg-purple-100 text-purple-600 px-2 py-1 rounded">2035년</span>
                </div>
                <div className="text-xs text-gray-600 space-y-1">
                  <div>• 노량진~청학, 논현역 경유</div>
                  <div>• 서울 영등포 직결</div>
                  <div>• 21.9km, 17개역</div>
                </div>
              </div>

              <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-semibold text-yellow-800">인천2호선 연장</h4>
                  <span className="text-xs bg-yellow-100 text-yellow-600 px-2 py-1 rounded">계획승인</span>
                </div>
                <div className="text-xs text-gray-600 space-y-1">
                  <div>• 남동구청~논현역 연결</div>
                  <div>• 7.52km, 4개역</div>
                  <div>• 남동구 전역 직결</div>
                </div>
              </div>
            </div>

            {/* 교통 허브 전망 */}
            <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border">
              <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
                🌟 논현동 교통 허브 전망
              </h4>
              <div className="text-sm text-gray-700 space-y-1">
                <div>• <strong>현재:</strong> 수인분당선 1개 노선</div>
                <div>• <strong>미래:</strong> 최대 4개 노선 교차</div>
                <div>• <strong>효과:</strong> 수도권 메가 허브 발전</div>
              </div>
              <div className="mt-2 p-2 bg-white rounded text-xs">
                <div className="text-center font-medium text-gray-800">
                  수인분당선 ↔ 경강선 ↔ 제2경인선 ↔ 인천2호선
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 안내 사항 */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2 flex items-center">
            💡 실거래가 정보 안내
          </h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• 국토교통부 실거래가 공개시스템 기준 데이터입니다.</li>
            <li>• 최근 3개월간의 거래 내역을 제공합니다.</li>
            <li>• 평당 가격은 3.3㎡ 기준으로 계산됩니다.</li>
            <li>• 데이터는 주기적으로 업데이트됩니다.</li>
          </ul>
        </div>
      </main>

      {/* 공통 푸터 */}
      <Footer variant="dark" />
    </div>
  );
}