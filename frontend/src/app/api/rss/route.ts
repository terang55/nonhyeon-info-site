import { NextResponse } from 'next/server';
import { BASE_URL } from '@/lib/siteConfig';
import fs from 'fs';
import path from 'path';

interface NewsItem {
  title: string;
  url: string;
  description: string;
  date: string;
  source: string;
  platform: string;
  summary?: string;
  image?: string;
  author?: string;
  category?: string;
}

export async function GET() {
  try {
    console.log('📡 RSS 피드 생성 시작');

    // 최신 뉴스 데이터 파일 찾기
    const dataPath = path.join(process.cwd(), 'public', 'data', 'enhanced_news');
    let newsData: NewsItem[] = [];
    
    if (fs.existsSync(dataPath)) {
      const files = fs.readdirSync(dataPath);
      const latestFile = files
        .filter(file => file.startsWith('all_platforms_') && file.endsWith('.json'))
        .sort()
        .reverse()[0];
      
      if (latestFile) {
        const filePath = path.join(dataPath, latestFile);
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const data = JSON.parse(fileContent);
        
        // 최신 30개 항목만 선택
        newsData = data.slice(0, 30);
        console.log(`📰 RSS 피드용 뉴스 ${newsData.length}개 로드`);
      }
    }

    // RSS XML 생성
    const rssItems = newsData.map(item => {
      const pubDate = new Date(item.date).toUTCString();
      const cleanTitle = item.title.replace(/[<>&'"]/g, (char) => {
        switch (char) {
          case '<': return '&lt;';
          case '>': return '&gt;';
          case '&': return '&amp;';
          case "'": return '&apos;';
          case '"': return '&quot;';
          default: return char;
        }
      });
      
      const cleanDescription = (item.summary || item.description || '').replace(/[<>&'"]/g, (char) => {
        switch (char) {
          case '<': return '&lt;';
          case '>': return '&gt;';
          case '&': return '&amp;';
          case "'": return '&apos;';
          case '"': return '&quot;';
          default: return char;
        }
      });
      
      return `
        <item>
          <title>${cleanTitle}</title>
          <link>${item.url}</link>
          <description><![CDATA[${cleanDescription}]]></description>
          <pubDate>${pubDate}</pubDate>
          <guid>${item.url}</guid>
          <source>${item.source}</source>
          <category>${item.platform}</category>
          ${item.author ? `<author>${item.author}</author>` : ''}
          ${item.image ? `<enclosure url="${item.image}" type="image/jpeg" />` : ''}
        </item>
      `;
    }).join('');
    
    const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>인천논현라이프 - 인천논현동 최신 소식</title>
    <link>${BASE_URL}</link>
    <description>인천시 남동구 논현동 지역의 최신 뉴스, 블로그, 유튜브 콘텐츠를 실시간으로 제공합니다.</description>
    <language>ko-KR</language>
    <copyright>© 2025 인천논현라이프. All rights reserved.</copyright>
    <managingEditor>info@nonhyeon.life (인천논현라이프)</managingEditor>
    <webMaster>info@nonhyeon.life (인천논현라이프)</webMaster>
    <pubDate>${new Date().toUTCString()}</pubDate>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <category>지역정보</category>
    <category>논현동</category>
    <category>인천</category>
    <category>남동구</category>
    <ttl>60</ttl>
    <image>
      <url>${BASE_URL}/android-chrome-192x192.png</url>
      <title>인천논현라이프</title>
      <link>${BASE_URL}</link>
      <width>192</width>
      <height>192</height>
    </image>
    <atom:link href="${BASE_URL}/api/rss" rel="self" type="application/rss+xml" />
${rssItems}
  </channel>
</rss>`;

    console.log('✅ RSS 피드 생성 완료');

    return new NextResponse(rssXml, {
      status: 200,
      headers: {
        'Content-Type': 'application/rss+xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
        'CDN-Cache-Control': 'public, max-age=3600',
        'Vercel-CDN-Cache-Control': 'public, max-age=3600',
      },
    });

  } catch (error) {
    console.error('❌ RSS 피드 생성 오류:', error);
    
    // 오류 시 기본 RSS 반환
    const errorRss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
         <title>인천논현라이프 - 인천논현동 최신 소식</title>
     <link>${BASE_URL}</link>
     <description>인천시 남동구 논현동 지역의 최신 뉴스, 블로그, 유튜브 콘텐츠를 실시간으로 제공합니다.</description>
    <language>ko-KR</language>
    <pubDate>${new Date().toUTCString()}</pubDate>
    <item>
      <title>인천논현라이프 서비스 점검 중</title>
      <link>${BASE_URL}</link>
      <description>현재 RSS 피드 서비스 점검 중입니다. 잠시 후 다시 시도해주세요.</description>
      <pubDate>${new Date().toUTCString()}</pubDate>
    </item>
  </channel>
</rss>`;

    return new NextResponse(errorRss, {
      status: 200,
      headers: {
        'Content-Type': 'application/rss+xml; charset=utf-8',
        'Cache-Control': 'public, max-age=300, s-maxage=300',
      },
    });
  }
} 