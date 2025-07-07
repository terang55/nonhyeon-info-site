import { NextResponse } from 'next/server';
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

interface NewsItem {
  title: string;
  content?: string;
  summary?: string;
  source?: string;
  press?: string;
  channel?: string;
  date: string;
  url: string;
  keyword: string;
  content_length?: number;
  type?: string;
}

export async function GET() {
  try {
    // public/data/enhanced_news 디렉토리 경로 (프론트엔드 동기화된 데이터)
    const dataDir = join(process.cwd(), 'public', 'data', 'enhanced_news');
    
    // enhanced_news 디렉토리의 모든 JSON 파일 읽기 (sync_summary.json 제외)
    const files = readdirSync(dataDir).filter(file => 
      file.endsWith('.json') && file !== 'sync_summary.json'
    );
    
    let allNews: NewsItem[] = [];
    
    // 각 파일의 뉴스 데이터 읽기
    files.forEach(file => {
      try {
        const filePath = join(dataDir, file);
        const fileContent = readFileSync(filePath, 'utf-8');
        const newsData = JSON.parse(fileContent);
        
        if (Array.isArray(newsData)) {
          allNews = allNews.concat(newsData);
        }
      } catch (error) {
        console.error(`Error reading file ${file}:`, error);
      }
    });

    // 통계 계산
    const totalArticles = allNews.length;
    
    // 카테고리별 통계
    const categoryStats = allNews.reduce((acc, item) => {
      acc[item.keyword] = (acc[item.keyword] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // 소스별 통계 (press, source, channel 모두 고려)
    const sourceStats = allNews.reduce((acc, item) => {
      const source = item.source || item.press || item.channel || 'Unknown';
      acc[source] = (acc[source] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // 타입별 통계 (뉴스 vs 블로그 vs 유튜브)
    const typeStats = allNews.reduce((acc, item) => {
      const type = item.type || 'news';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // 날짜별 통계 (최근 7일)
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    }).reverse();

    const dailyStats = last7Days.map(date => {
      const count = allNews.filter(item => {
        try {
          const itemDate = new Date(item.date).toISOString().split('T')[0];
          return itemDate === date;
        } catch {
          return false;
        }
      }).length;
      
      return { date, count };
    });

    // 평균 콘텐츠 길이 (content_length가 있는 경우만)
    const validContentLengths = allNews
      .filter(item => item.content_length && item.content_length > 0)
      .map(item => item.content_length!);
    
    const avgContentLength = validContentLengths.length > 0 
      ? Math.round(validContentLengths.reduce((sum, length) => sum + length, 0) / validContentLengths.length)
      : 0;

    // 최신 업데이트 시간
    const lastUpdated = allNews.length > 0 
      ? new Date().toISOString() // 현재 시간 사용
      : new Date().toISOString();

    // 상위 카테고리 (실제 키워드 기준)
    const topCategories = Object.entries(categoryStats)
      .map(([keyword, count]) => ({ keyword, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return NextResponse.json({
      success: true,
      data: {
        totalArticles,
        avgContentLength,
        lastUpdated,
        stats: {
          categories: categoryStats,
          sources: sourceStats,
          types: typeStats,
          daily: dailyStats,
          topCategories
        },
        summary: {
          newsCount: typeStats.news || 0,
          blogCount: typeStats.blog || 0,
          youtubeCount: typeStats.youtube || 0,
          totalSources: Object.keys(sourceStats).length,
          totalCategories: Object.keys(categoryStats).length
        }
      },
      timestamp: new Date().toISOString()
    }, {
      headers: {
        'Cache-Control': 'public, max-age=600, s-maxage=600', // 10분 캐시 (통계는 덜 자주 변경됨)
        'CDN-Cache-Control': 'public, max-age=600',
        'Vercel-CDN-Cache-Control': 'public, max-age=600',
        'ETag': `"stats-${new Date().getTime()}"`,
        'Last-Modified': new Date().toUTCString()
      }
    });

  } catch (error) {
    console.error('Error in stats API:', error);
    
    // 오류 시에는 빈 통계 반환하여 문제를 명확히 함
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      data: {
        totalArticles: 0,
        avgContentLength: 0,
        lastUpdated: new Date().toISOString(),
        stats: {
          categories: {},
          sources: {},
          types: {},
          daily: [],
          topCategories: []
        },
        summary: {
          newsCount: 0,
          blogCount: 0,
          youtubeCount: 0,
          totalSources: 0,
          totalCategories: 0
        }
      },
      timestamp: new Date().toISOString()
    }, {
      headers: {
        'Cache-Control': 'public, max-age=60, s-maxage=60', // 에러 시 1분만 캐시
        'CDN-Cache-Control': 'public, max-age=60',
        'Vercel-CDN-Cache-Control': 'public, max-age=60'
      }
    });
  }
} 