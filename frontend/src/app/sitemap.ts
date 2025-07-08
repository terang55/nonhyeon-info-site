import { MetadataRoute } from 'next'
import { BASE_URL } from '@/lib/siteConfig'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = BASE_URL
  
  // 현재 날짜
  const now = new Date()
  
  // 기본 페이지들
  const routes = [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: 'hourly' as const,
      priority: 1.0,
    },
    // 메인 페이지의 카테고리별 변형 (실제로는 같은 페이지지만 Google에게 구조를 알려주기 위함)
    {
      url: `${baseUrl}/#news`,
      lastModified: now,
      changeFrequency: 'hourly' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/#blog`,
      lastModified: now,
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/#youtube`,
      lastModified: now,
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    // 병원/약국 정보 페이지
    {
      url: `${baseUrl}/#medical`,
      lastModified: now,
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    // 정책 페이지들
    {
      url: `${baseUrl}/privacy`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.3,
    },
    // 지하철 정보 페이지
    {
      url: `${baseUrl}/subway`,
      lastModified: now,
      changeFrequency: 'daily' as const,
      priority: 0.8,
    },
    // 부동산 정보 페이지
    {
      url: `${baseUrl}/realestate`,
      lastModified: now,
      changeFrequency: 'daily' as const,
      priority: 0.8,
    },
    // 학원 정보 페이지
    {
      url: `${baseUrl}/academy`,
      lastModified: now,
      changeFrequency: 'daily' as const,
      priority: 0.8,
    },
    // 오프라인 페이지
    {
      url: `${baseUrl}/offline`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.1,
    },
    // 지하철 관련 키워드 페이지들
    {
      url: `${baseUrl}/subway?station=호구포역`,
      lastModified: now,
      changeFrequency: 'hourly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/subway?station=인천논현역`,
      lastModified: now,
      changeFrequency: 'hourly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/subway?station=소래포구역`,
      lastModified: now,
      changeFrequency: 'hourly' as const,
      priority: 0.7,
    },
    // API 엔드포인트들 (robots.txt에서 차단하지만 sitemap에는 포함하지 않음)
    // 중요한 지역 정보 키워드 페이지들 (실제로는 검색 결과지만 SEO를 위해 포함)
    {
      url: `${baseUrl}/#인천논현동-맛집`,
      lastModified: now,
      changeFrequency: 'daily' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/#인천논현동-카페`,
      lastModified: now,
      changeFrequency: 'daily' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/#인천논현동-부동산`,
      lastModified: now,
      changeFrequency: 'daily' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/#인천논현동-육아`,
      lastModified: now,
      changeFrequency: 'daily' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/#에코메트로`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/#소래포구`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/#호구포`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/#논현지구`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    },
    // 의료 관련 키워드 페이지들
    {
      url: `${baseUrl}/#인천논현동-병원`,
      lastModified: now,
      changeFrequency: 'daily' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/#인천논현동-약국`,
      lastModified: now,
      changeFrequency: 'daily' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/#인천논현동-내과`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/#인천논현동-소아과`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/#인천논현동-치과`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/#인천논현동-응급실`,
      lastModified: now,  
      changeFrequency: 'daily' as const,
      priority: 0.8,
    },
    // 지하철 관련 키워드 페이지들
    {
      url: `${baseUrl}/#수인분당선`,
      lastModified: now,
      changeFrequency: 'daily' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/#인천논현역`,
      lastModified: now,
      changeFrequency: 'hourly' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/#호구포역`,
      lastModified: now,
      changeFrequency: 'hourly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/#소래포구역`,
      lastModified: now,
      changeFrequency: 'hourly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/#지하철-시간표`,
      lastModified: now,
      changeFrequency: 'hourly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/#논현동-지하철`,
      lastModified: now,
      changeFrequency: 'daily' as const,
      priority: 0.8,
    },
  ]

  return routes
} 