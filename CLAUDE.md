# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
This is a regional information hub for Nonhyeon-dong, Namdong-gu, Incheon, South Korea. It combines a Next.js 15 frontend with a Python-based web crawling system to provide real-time local news, real estate data, transportation info, and community updates.

## Architecture

### Frontend (Next.js 15)
- **App Router**: Uses Next.js 15 with the new app directory structure
- **API Routes**: Located in `frontend/src/app/api/` - handles data fetching from JSON files
- **Components**: Functional components with TypeScript, using Tailwind CSS for styling
- **PWA Support**: Service worker and manifest for offline functionality
- **SEO Optimization**: Structured data, dynamic meta tags, and sitemap generation

### Backend (Python Crawling System)
- **Enhanced Crawler**: `crawler/enhanced_crawler.py` - main crawling logic using Selenium
- **Scheduler**: `crawler/enhanced_scheduler.py` - automated scheduling system
- **Data Sync**: `crawler/sync_to_frontend.py` - syncs crawled data to frontend
- **Configuration**: `crawler/config.py` - platform-specific keywords and settings

### Data Flow
1. Python crawlers collect data from news sites, blogs, and YouTube
2. Data is processed and stored in `data/enhanced_news/` as JSON files
3. Sync script copies data to `frontend/public/data/enhanced_news/`
4. Frontend API routes read from public directory and serve to React components

## Development Commands

### Frontend Development
```bash
cd frontend
npm install          # Install dependencies
npm run dev          # Start development server (uses --turbopack)
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint (no test command - testing not configured)
```

### Testing Status
- **No testing framework configured**: The project currently has no Jest, Vitest, or other testing setup
- Manual testing only through browser verification and debugging scripts
- Crawler has manual test scripts (`test_*.py`) for debugging, not automated tests

### Python Crawler Development
```bash
cd crawler
pip install -r requirements.txt    # Install Python dependencies
python enhanced_crawler.py         # Run crawler manually
python enhanced_scheduler.py       # Start scheduled crawling
python sync_to_frontend.py        # Sync data to frontend
python remove_duplicates.py       # Clean duplicate data
```

### Batch Scripts (Windows)
```bash
# Located in crawler/ directory
crawl_and_sync.bat         # Run crawler and sync
crawl_sync_push.bat        # Crawl, sync, and git push
start_scheduler.bat        # Start scheduler daemon
test_cafe_now.bat          # Test cafe crawling
```

## Key Configuration Files

### Frontend Configuration
- `frontend/next.config.ts`: Next.js config with image optimization for YouTube thumbnails
- `frontend/tsconfig.json`: TypeScript configuration
- `frontend/tailwind.config.js`: Tailwind CSS configuration
- `vercel.json`: Vercel deployment settings with caching headers

### Crawler Configuration
- `crawler/config.py`: Platform-specific keywords and crawling settings
- `crawler/requirements.txt`: Python dependencies

## Data Structure

### News Items
```typescript
interface NewsItem {
  title: string;
  content: string;
  source: string;
  date: string;
  url: string;
  keyword: string;
  content_length: number;
  type?: 'news' | 'blog' | 'youtube';
  // YouTube-specific fields
  channel?: string;
  views?: string;
  upload_time?: string;
  thumbnail?: string;
}
```

### File Naming Convention
- `{platform}_{keyword}_enhanced_news_{timestamp}.json`
- `all_platforms_enhanced_news_{timestamp}.json` (merged data)

## Important Implementation Details

### Duplicate Detection
The crawler uses intelligent duplicate detection:
- Title similarity: 80% threshold
- Content similarity: 70% threshold
- Prevents duplicate articles across different sources

### SEO Implementation
- Dynamic meta tags in `frontend/src/app/components/SEOHead.tsx`
- Structured data (JSON-LD) for search engines
- Sitemap generation in `frontend/src/app/sitemap.ts`

### Performance Optimizations
- API caching: 5-minute cache for news, 10-minute for stats
- Image optimization: WebP/AVIF formats with Next.js Image component
- Turbopack for faster development builds

### Error Handling
- Graceful failures in crawler with comprehensive logging
- Frontend error boundaries and loading states
- Retry mechanisms for failed requests

## Development Guidelines

### Code Style
- All code comments and responses in Korean
- Strict TypeScript (no `any` types)
- Tailwind CSS only (no inline styles)  
- Mobile-first responsive design
- No hardcoded URLs or keywords
- No console.log in production
- Meaningful variable and function names

### Git Workflow - CRITICAL RULES
- **사용자 권한**: AI는 절대로 사용자 허락 없이 git 작업을 수행하지 않음
- **로컬 실행**: 모든 로컬 실행(`npm run dev`, `npm run build` 등)은 사용자가 직접 수행
- **커밋 승인**: `git add`, `git commit`, `git push` 등 모든 git 작업 전에 반드시 사용자 허락 필요
- Commit messages use Korean with emoji prefixes:
  - 🚀 기능 추가, 🔧 버그 수정, 📝 문서 업데이트, 🎨 UI/UX 개선
  - ⚡ 성능 최적화, 🔍 SEO 최적화, 🗃️ 데이터베이스 관련, 🧹 코드 정리

### Security
- API keys in environment variables
- Content Security Policy headers
- Input validation and sanitization

## Common Tasks

### Adding New Crawling Keywords
1. Edit `crawler/config.py` in the `SEARCH_KEYWORDS` dictionary
2. Test with manual crawler run
3. Deploy and monitor results

### Updating Frontend Components
1. Components are in `frontend/src/app/components/`
2. Use TypeScript interfaces for props
3. Follow existing patterns for loading states and error handling

### Debugging Crawler Issues
- Check logs in `data/logs/enhanced_crawler_YYYYMMDD.log`
- Use `test_` scripts for isolated testing
- Monitor Chrome headless browser output

## Deployment
- Frontend: Automatic deployment to Vercel on git push
- Crawler: Runs on local/server environment with scheduled tasks
- Data sync: Automated through sync scripts

## External Dependencies
- OpenWeather API for weather data
- Kakao API for location services
- YouTube thumbnails for video content
- Naver search for news and blog content

## Key Project Context

### Target Area & Keywords
- **Location**: 인천 남동구 논현동 (Nonhyeon-dong, Namdong-gu, Incheon)
- **Primary Keywords**: 논현동, 에코메트로, 소래포구, 호구포
- **Target Users**: 논현동 주민 및 관심있는 사람들
- **Goal**: 지역 정보 허브로서의 신뢰성 확보 및 AdSense 수익화

### Development Workflow
1. **AI Code Modification**: AI performs code changes and file creation/editing
2. **User Local Testing**: User manually runs `npm run dev`, `npm run build` for verification
3. **User Review**: User reviews and approves all changes
4. **User Git Operations**: Only after user approval, AI can perform git operations
5. **Auto Deployment**: Vercel automatically deploys on git push