import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { BASE_URL } from '@/lib/siteConfig';
import PWAInstallPrompt from './components/PWAInstallPrompt';
import NetworkStatus from './components/NetworkStatus';
import BottomNavigation from './components/BottomNavigation';
import WebVitalsMonitor from './components/WebVitalsMonitor';

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "인천논현라이프 | 인천 남동구 논현동 생활정보 플랫폼",
    template: "%s | 인천논현라이프"
  },
  description: "논현동 주민을 위한 실시간 뉴스·지하철·부동산 등 생활정보 플랫폼",
  keywords: [
    "논현동", "인천 논현동", "남동구 논현동", "논현지구", "에코메트로",
    "논현동 맛집", "논현동 카페", "논현동 부동산", "논현동 육아",
    "논현동 병원", "논현동 약국", "논현동 의료", "논현동 내과", "논현동 소아과",
    "논현동 치과", "논현동 응급실", "논현동 야간진료", "인천논현역 병원",
    "수인분당선", "인천논현역", "호구포역", "소래포구역", "지하철 시간표",
    "논현동 지하철", "수인선", "지하철 실시간", "전철 도착시간", "지하철역 정보",
    "소래포구", "호구포", "논현동 정보", "논현동 뉴스", "논현동 생활정보",
    "인천 남동구", "논현동 아파트", "논현동 교통", "논현동 학원"
  ],
  authors: [{ name: "인천논현라이프", url: BASE_URL }],
  creator: "인천논현라이프",
  publisher: "인천논현라이프",
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
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: BASE_URL,
    siteName: "인천논현라이프",
    title: "인천논현라이프 | 인천 남동구 논현동 생활정보 플랫폼",
    description: "논현동 주민을 위한 실시간 뉴스·지하철·부동산 등 생활정보 플랫폼",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "인천논현라이프 - 인천 남동구 논현동 생활정보 플랫폼",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "인천논현라이프 | 인천 남동구 논현동 생활정보 플랫폼",
    description: "인천 남동구 논현동 주민들을 위한 종합 정보 플랫폼. 실시간 뉴스, 수인분당선 지하철 정보, 병원/약국 정보, 맛집, 카페, 부동산, 육아 정보를 한눈에 확인하세요.",
    images: ["/og-image.jpg"],
    creator: "@nonhyeon_info",
  },
  verification: {
    google: "e3VR6BkZXX1VtX4dm2Zx6q0L2bgHC1FFCPHpnJ6n_hI", // Google Search Console 인증 코드
    other: {
      "naver-site-verification": "naver-verification-code", // 네이버 서치어드바이저 코드
    },
  },
  category: "지역정보",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        {/* PWA 메타 태그 */}
        <meta name="application-name" content="논현라이프" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="논현라이프" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        <meta name="msapplication-TileColor" content="#2563eb" />
        <meta name="msapplication-tap-highlight" content="no" />
        <meta name="theme-color" content="#2563eb" />
        
        {/* 네이버 애널리틱스 */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window,document,'script',
              'https://wcs.naver.net/wcslog.js');
              wcs_add_config({
                'account': 'NAVER_ANALYTICS_ID',
                'domain': 'nonhyeon.life'
              });
              wcs_do();
            `,
          }}
        />
        
        {/* 추가 SEO 메타 태그 */}
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#2563eb" />
        <meta name="msapplication-TileColor" content="#2563eb" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="인천논현라이프" />
        
        {/* 네이버 SEO 최적화 메타 태그 */}
        <meta name="naver-site-verification" content="6f6f6592110192cd2491d3c5bf4133592c100558" />
        
        {/* Google AdSense 인증 */}
        <meta name="google-adsense-account" content="ca-pub-2592538242403472" />
        <meta name="description" content="논현동 주민을 위한 실시간 뉴스·지하철·부동산 등 생활정보 플랫폼" />
        <meta name="keywords" content="논현동,인천논현동,남동구논현동,논현지구,에코메트로,논현동맛집,논현동카페,논현동부동산,논현동육아,논현동병원,논현동약국,논현동의료,수인분당선,인천논현역,호구포역,소래포구역,지하철시간표,소래포구,호구포" />
        <meta name="author" content="인천논현라이프" />
        <meta name="publisher" content="인천논현라이프" />
        <meta name="copyright" content="인천논현라이프" />
        <meta name="robots" content="index,follow" />
        <meta name="revisit-after" content="1 days" />
        <meta name="content-language" content="ko" />
        
        {/* Open Graph for Naver */}
        <meta property="og:locale" content="ko_KR" />
        <meta property="og:site_name" content="인천논현라이프" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="인천논현라이프 | 인천 남동구 논현동 생활정보 플랫폼" />
        <meta property="og:description" content="논현동 주민을 위한 실시간 뉴스·지하철·부동산 등 생활정보 플랫폼" />
        <meta property="og:url" content={BASE_URL} />
        <meta property="og:image" content={`${BASE_URL}/og-image.jpg`} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="인천논현라이프 - 인천 남동구 논현동 생활정보 플랫폼" />
        
        {/* 지역 정보 메타 태그 */}
        <meta name="geo.region" content="KR-28" />
        <meta name="geo.placename" content="인천광역시 남동구 논현동" />
        <meta name="geo.position" content="37.3894;126.7317" />
        <meta name="ICBM" content="37.3894, 126.7317" />
        
        {/* 파비콘 - 논현동 건물 스타일 */}
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
        
        {/* RSS 피드 */}
        <link rel="alternate" type="application/rss+xml" title="인천논현라이프 - 전체" href="/api/rss" />
        <link rel="alternate" type="application/rss+xml" title="인천논현라이프 - 뉴스" href="/api/rss?category=뉴스" />
        <link rel="alternate" type="application/rss+xml" title="인천논현라이프 - 블로그" href="/api/rss?category=블로그" />
        <link rel="alternate" type="application/rss+xml" title="인천논현라이프 - 유튜브" href="/api/rss?category=유튜브" />
        <link rel="alternate" type="application/rss+xml" title="인천논현라이프 - 의료정보" href="/api/rss?category=의료" />
        
        {/* 구조화된 데이터 - 지역 비즈니스 */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "LocalBusiness",
              "name": "인천논현라이프",
              "description": "인천 남동구 논현동 주민들을 위한 종합 정보 플랫폼",
              "url": BASE_URL,
              "address": {
                "@type": "PostalAddress",
                "addressCountry": "KR",
                "addressRegion": "인천광역시",
                "addressLocality": "남동구",
                "streetAddress": "논현동"
              },
              "geo": {
                "@type": "GeoCoordinates",
                "latitude": 37.3894,
                "longitude": 126.7317
              },
              "areaServed": {
                "@type": "Place",
                "name": "인천광역시 남동구 논현동"
              },
              "knowsAbout": [
                "논현동 맛집", "논현동 카페", "논현동 부동산", 
                "논현동 육아", "논현동 병원", "논현동 약국", "논현동 의료",
                "수인분당선", "지하철 정보", "호구포역", "인천논현역", "소래포구역",
                "에코메트로", "소래포구", "호구포"
              ]
            })
          }}
        />
        
        {/* 구조화된 데이터 - 웹사이트 */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "인천논현라이프",
              "url": BASE_URL,
              "description": "인천 남동구 논현동 지역 정보 종합 플랫폼",
              "inLanguage": "ko-KR",
              "potentialAction": {
                "@type": "SearchAction",
                "target": {
                  "@type": "EntryPoint",
                  "urlTemplate": `${BASE_URL}?category={search_term_string}`
                },
                "query-input": "required name=search_term_string"
              },
              "about": {
                "@type": "Place",
                "name": "인천광역시 남동구 논현동",
                "geo": {
                  "@type": "GeoCoordinates",
                  "latitude": 37.3894,
                  "longitude": 126.7317
                }
              }
            })
          }}
        />
        
        {/* 네이버용 조직 구조화 데이터 */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "인천논현라이프",
              "url": BASE_URL,
              "logo": `${BASE_URL}/og-image.jpg`,
              "description": "인천 남동구 논현동 주민들을 위한 종합 정보 플랫폼",
              "address": {
                "@type": "PostalAddress",
                "addressCountry": "KR",
                "addressRegion": "인천광역시",
                "addressLocality": "남동구",
                "streetAddress": "논현동"
              },
              "areaServed": {
                "@type": "Place",
                "name": "인천광역시 남동구 논현동"
              },
              "knowsAbout": [
                "논현동 지역정보", "논현동 맛집", "논현동 카페", 
                "논현동 부동산", "논현동 육아", "논현동 병원", "논현동 약국", 
                "논현동 의료", "수인분당선", "지하철 정보", "호구포역", "인천논현역", "소래포구역",
                "에코메트로", "소래포구", "호구포", "논현지구"
              ],
              "sameAs": [
                BASE_URL
              ]
            })
          }}
        />
        
        {/* 네이버용 뉴스 미디어 구조화 데이터 */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "NewsMediaOrganization",
              "name": "인천논현라이프",
              "url": BASE_URL,
              "logo": {
                "@type": "ImageObject",
                "url": `${BASE_URL}/og-image.jpg`,
                "width": 1200,
                "height": 630
              },
              "description": "인천 남동구 논현동 지역 뉴스 및 정보 제공",
              "publishingPrinciples": BASE_URL,
              "areaServed": {
                "@type": "Place",
                "name": "인천광역시 남동구 논현동"
              },
              "audience": {
                "@type": "Audience",
                "geographicArea": {
                  "@type": "Place",
                  "name": "인천광역시 남동구 논현동"
                }
              }
            })
          }}
        />

        {/* 구조화된 데이터 - 의료 정보 서비스 */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "MedicalWebPage",
              "name": "인천논현라이프 병원/약국 정보",
              "url": BASE_URL,
              "description": "인천 남동구 논현동 주변 병원 및 약국 정보를 실시간으로 제공하는 의료 정보 서비스",
              "about": {
                "@type": "MedicalCondition",
                "name": "지역 의료 서비스"
              },
              "mainEntity": {
                "@type": "ItemList",
                "name": "인천논현라이프 의료기관 목록",
                "description": "인천논현라이프 및 인근 지역의 병원, 약국 정보",
                "itemListElement": [
                  {
                    "@type": "MedicalOrganization",
                    "name": "인천논현라이프 지역 병원",
                    "description": "내과, 외과, 소아과, 치과 등 다양한 진료과목"
                  },
                  {
                    "@type": "Pharmacy",
                    "name": "인천논현라이프 지역 약국",
                    "description": "처방전 조제 및 일반의약품 판매"
                  }
                ]
              },
              "provider": {
                "@type": "Organization",
                "name": "인천논현라이프"
              },
              "areaServed": {
                "@type": "Place",
                "name": "인천광역시 남동구 논현동",
                "geo": {
                  "@type": "GeoCoordinates",
                  "latitude": 37.3894,
                  "longitude": 126.7317
                }
              }
            })
          }}
        />

        {/* 구조화된 데이터 - 지하철 교통 정보 서비스 */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebPage",
              "name": "인천논현라이프 지하철 정보",
              "url": `${BASE_URL}/subway`,
              "description": "수인분당선 호구포역, 인천논현역, 소래포구역의 실시간 열차 도착 정보 및 역 정보",
              "about": {
                "@type": "PublicTransportHub",
                "name": "수인분당선 논현동 구간"
              },
              "mainEntity": {
                "@type": "ItemList",
                "name": "인천논현라이프 지하철역 목록",
                "description": "수인분당선 논현동 인근 지하철역 정보",
                "itemListElement": [
                  {
                    "@type": "TrainStation",
                    "name": "호구포역",
                    "identifier": "K258",
                    "address": {
                      "@type": "PostalAddress",
                      "addressCountry": "KR",
                      "addressRegion": "인천광역시",
                      "addressLocality": "남동구"
                    },
                    "geo": {
                      "@type": "GeoCoordinates",
                      "latitude": 37.3814,
                      "longitude": 126.7286
                    }
                  },
                  {
                    "@type": "TrainStation",
                    "name": "인천논현역",
                    "identifier": "K259",
                    "address": {
                      "@type": "PostalAddress",
                      "addressCountry": "KR",
                      "addressRegion": "인천광역시",
                      "addressLocality": "남동구"
                    },
                    "geo": {
                      "@type": "GeoCoordinates",
                      "latitude": 37.3990,
                      "longitude": 126.7240
                    }
                  },
                  {
                    "@type": "TrainStation",
                    "name": "소래포구역",
                    "identifier": "K260",
                    "address": {
                      "@type": "PostalAddress",
                      "addressCountry": "KR",
                      "addressRegion": "인천광역시",
                      "addressLocality": "남동구"
                    },
                    "geo": {
                      "@type": "GeoCoordinates",
                      "latitude": 37.4067,
                      "longitude": 126.7194
                    }
                  }
                ]
              },
              "provider": {
                "@type": "Organization",
                "name": "인천논현라이프"
              },
              "areaServed": {
                "@type": "Place",
                "name": "인천광역시 남동구 논현동",
                "geo": {
                  "@type": "GeoCoordinates",
                  "latitude": 37.3894,
                  "longitude": 126.7317
                }
              }
            })
          }}
        />

        {/* Google AdSense - HEAD 태그 안에 위치 */}
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2592538242403472"
          crossOrigin="anonymous"
          strategy="beforeInteractive"
        />
        
        {/* AdSense 자동 광고 설정 */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (adsbygoogle = window.adsbygoogle || []).push({
                google_ad_client: "ca-pub-2592538242403472",
                enable_page_level_ads: true
              });
            `,
          }}
        />

        {/* FAQPage 구조화 데이터 */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              "mainEntity": [
                {
                  "@type": "Question",
                  "name": "논현동 지하철 정보는 얼마나 자주 업데이트되나요?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "호구포역, 인천논현역, 소래포구역의 실시간 도착 정보를 1분 간격으로 갱신합니다."
                  }
                },
                {
                  "@type": "Question",
                  "name": "논현동 맛집·카페 추천 데이터는 어디서 수집하나요?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "네이버 플레이스와 카카오맵 리뷰 데이터를 기반으로 매일 인기 지수를 분석해 선정합니다."
                  }
                },
                {
                  "@type": "Question",
                  "name": "병원·약국 정보의 정확도는 어느 정도인가요?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "보건복지부 공공데이터 포털에서 제공하는 최신 의료기관 정보를 매일 동기화하여 제공합니다."
                  }
                },
                {
                  "@type": "Question",
                  "name": "뉴스·블로그·유튜브 콘텐츠는 언제 수집되나요?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "자동으로 최신 콘텐츠를 수집하고 유사도 검사를 거쳐 반영합니다."
                  }
                },
                {
                  "@type": "Question",
                  "name": "광고 문의는 어떻게 하나요?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "상단 메뉴의 '광고문의' 버튼을 눌러 이메일로 요청하시면 24시간 이내 담당자가 회신드립니다."
                  }
                }
              ]
            })
          }}
        />
      </head>
      <body
        className={`${inter.variable} font-sans antialiased bg-gray-50`}
      >
        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-SSEDR2CED7"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-SSEDR2CED7', {
              page_title: document.title,
              page_location: window.location.href,
            });
          `}
        </Script>

        <NetworkStatus />
        {children}
        <BottomNavigation />
        <PWAInstallPrompt />
        <WebVitalsMonitor />
      </body>
    </html>
  );
}
