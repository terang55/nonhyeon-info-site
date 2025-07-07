import { NextRequest, NextResponse } from 'next/server';
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

interface NewsItem {
  title: string;
  content: string;
  source: string;
  date: string;
  url: string;
  keyword: string;
  content_length: number;
  type?: string; // 'news', 'blog', 'youtube'
  // 유튜브 전용 필드들
  channel?: string;
  views?: string;
  upload_time?: string;
  thumbnail?: string;
}

export async function GET(request: NextRequest) {
  try {
    // frontend/public/data/enhanced_news 디렉토리 경로
    const dataDir = join(process.cwd(), 'public', 'data', 'enhanced_news');
    
    // all_platforms로 시작하는 통합 파일만 읽기 (중복 방지)
    const files = readdirSync(dataDir).filter(file => 
      file.startsWith('all_platforms') && file.endsWith('.json')
    );
    
    let allNews: NewsItem[] = [];
    
    // 통합 파일만 읽기
    files.forEach(file => {
      try {
        const filePath = join(dataDir, file);
        const fileContent = readFileSync(filePath, 'utf-8');
        const newsData = JSON.parse(fileContent);
        
        if (Array.isArray(newsData)) {
          // 날짜가 없는 항목들은 crawled_at을 사용하거나 기본값 설정
          const processedData = newsData.map(item => ({
            ...item,
            date: item.date || item.upload_time || item.crawled_at || new Date().toISOString(),
            // 유튜브의 경우 source를 channel로 설정
            source: item.type === 'youtube' ? (item.channel || '유튜브') : (item.source || item.press || '알 수 없음')
          }));
          allNews = allNews.concat(processedData);
        }
      } catch (error) {
        console.error(`Error reading file ${file}:`, error);
      }
    });

    // 날짜 파싱 함수
    const parseDate = (dateString: string): Date => {
      if (!dateString) return new Date();
      
      // 한국어 날짜 형식 파싱: "2025.06.25. 오후 3:54"
      const koreanDateMatch = dateString.match(/(\d{4})\.(\d{1,2})\.(\d{1,2})\.\s*(오전|오후)\s*(\d{1,2}):(\d{2})/);
      
      if (koreanDateMatch) {
        const [, year, month, day, ampm, hour, minute] = koreanDateMatch;
        let hour24 = parseInt(hour);
        
        if (ampm === '오후' && hour24 !== 12) {
          hour24 += 12;
        }
        if (ampm === '오전' && hour24 === 12) {
          hour24 = 0;
        }
        
        return new Date(
          parseInt(year),
          parseInt(month) - 1,
          parseInt(day),
          hour24,
          parseInt(minute)
        );
      }
      
      // 표준 날짜 형식 시도
      const date = new Date(dateString);
      return isNaN(date.getTime()) ? new Date() : date;
    };

    // 타입별 우선순위와 날짜 기준으로 정렬 (뉴스 > 블로그 > 유튜브)
    allNews.sort((a, b) => {
      // 타입별 우선순위 설정
      const getTypePriority = (type?: string) => {
        if (type === 'news') return 1;
        if (type === 'blog') return 2;
        if (type === 'youtube') return 3;
        return 1; // 기본값은 뉴스로 처리
      };
      
      const priorityA = getTypePriority(a.type);
      const priorityB = getTypePriority(b.type);
      
      // 타입 우선순위가 다르면 타입으로 정렬
      if (priorityA !== priorityB) {
        return priorityA - priorityB;
      }
      
      // 같은 타입이면 날짜로 정렬 (최신순)
      return parseDate(b.date).getTime() - parseDate(a.date).getTime();
    });

    // URL 파라미터 처리
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '50');

    // 필터링
    let filteredNews = allNews;

    if (category && category !== '전체') {
      // 타입별 필터링으로 변경
      const typeMap: { [key: string]: string } = {
        '뉴스': 'news',
        '블로그': 'blog',
        '유튜브': 'youtube'
      };
      
      const targetType = typeMap[category];
      if (targetType) {
        filteredNews = filteredNews.filter(item => item.type === targetType);
      }
    }

    if (search) {
      const searchLower = search.toLowerCase().trim();
      
      // 검색어가 너무 짧으면 필터링하지 않음
      if (searchLower.length < 2) {
        return NextResponse.json({
          success: true,
          data: [],
          total: 0,
          timestamp: new Date().toISOString(),
          note: "검색어는 최소 2글자 이상이어야 합니다."
        });
      }
      
      filteredNews = filteredNews.filter(item => {
        const title = item.title.toLowerCase();
        const content = item.content.toLowerCase();
        const keyword = item.keyword.toLowerCase();
        const source = item.source.toLowerCase();
        
        // 1. 완전 일치 (가장 높은 우선순위)
        if (title.includes(searchLower) || keyword.includes(searchLower)) {
          return true;
        }
        
        // 2. 단어 단위 검색 (공백으로 구분된 각 단어가 모두 포함되어야 함)
        const searchWords = searchLower.split(' ').filter(word => word.length > 0);
        const titleMatch = searchWords.every(word => title.includes(word));
        const contentMatch = searchWords.every(word => content.includes(word));
        const sourceMatch = searchWords.every(word => source.includes(word));
        
        return titleMatch || contentMatch || sourceMatch;
      });
    }

    // 제한된 개수만 반환
    filteredNews = filteredNews.slice(0, limit);

    return NextResponse.json({
      success: true,
      data: filteredNews,
      total: filteredNews.length,
      timestamp: new Date().toISOString()
    }, {
      headers: {
        'Cache-Control': 'public, max-age=300, s-maxage=300', // 5분 캐시
        'CDN-Cache-Control': 'public, max-age=300',
        'Vercel-CDN-Cache-Control': 'public, max-age=300',
        'ETag': `"news-${new Date().getTime()}"`, // 변경 감지용
        'Last-Modified': new Date().toUTCString()
      }
    });

  } catch (error) {
    console.error('Error in news API:', error);
    
    // 오류 시 더미 데이터 반환
    const mockData: NewsItem[] = [
      {
        title: "'약물 운전' 이경규 소식에…정신과 전문의 \"가뜩이나 편견 높은데\"",
        content: "정신건강의학과 전문의가 방송인 이경규씨의 약물 운전 사건과 관련해 \"정신과 약물 복용자 전체에 대한 사회적 낙인과 불필요한 오해가 확산할 수 있다\"고 우려했다.",
        source: "중앙일보",
        date: "2025-06-26T05:55:00",
        url: "https://n.news.naver.com/mnews/article/025/0003450871",
        keyword: "논현동",
        content_length: 1573
      },
      {
        title: "후루룩, 소리도 맛있다…끊을 수 없는 중독의 맛, 면 [Find Dining]",
        content: "속을 뻥 뚫어주는 냉면, 감칠맛 폭발 메밀, 진한 국물 칼국수까지. 삼시 세끼 면만 먹고도 살 수 있는 당신을 위해 소개한다. 특별하지 않지만 아주 특별한 면요리다.",
        source: "MBN",
        date: "2025-06-13T14:06:00",
        url: "https://n.news.naver.com/mnews/article/057/0001891292",
        keyword: "논현동 맛집",
        content_length: 1294
      },
      {
        title: "\"내년 수도권 입주 물량 10만 가구까지 줄어든다\"…공급 충격 예고한 건설산업연구원",
        content: "내년 수도권 입주 물량이 10만 가구 수준으로 줄어든다는 분석이 나왔다. 올해 입주 물량이 14만 가구로 예상되는데 이보다 4만 가구(28.5%)가 감소할 것이라는 의미다.",
        source: "조선비즈",
        date: "2025-06-24T16:04:00",
        url: "https://n.news.naver.com/mnews/article/366/0001087513",
        keyword: "논현동 부동산",
        content_length: 1117
      }
    ];

    return NextResponse.json({
      success: true,
      data: mockData,
      total: mockData.length,
      timestamp: new Date().toISOString(),
      note: "Using mock data due to file system error"
    }, {
      headers: {
        'Cache-Control': 'public, max-age=60, s-maxage=60', // 에러 시 1분만 캐시
        'CDN-Cache-Control': 'public, max-age=60',
        'Vercel-CDN-Cache-Control': 'public, max-age=60'
      }
    });
  }
} 