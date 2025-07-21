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



## 클로드 코드에서의 mcp-installer를 사용한 MCP (Model Context Protocol) 설치 및 설정 가이드 
공통 주의사항
1. 현재 사용 환경을 확인할 것. 모르면 사용자에게 물어볼 것. 
2. OS(윈도우,리눅스,맥) 및 환경들(WSL,파워셀,명령프롬프트등)을 파악해서 그에 맞게 세팅할 것. 모르면 사용자에게 물어볼 것.
3. mcp-installer을 이용해 필요한 MCP들을 설치할 것
   (user 스코프로 설치 및 적용할것)
4. 특정 MCP 설치시, 바로 설치하지 말고, WebSearch 도구로 해당 MCP의 공식 사이트 확인하고 현재 OS 및 환경 매치하여, 공식 설치법부터 확인할 것
5. 공식 사이트 확인 후에는 context7 MCP 존재하는 경우, context7으로 다시 한번 확인할 것
6. MCP 설치 후, task를 통해 디버그 모드로 서브 에이전트 구동한 후, /mcp 를 통해 실제 작동여부를 반드시 확인할 것 
7. 설정 시, API KEY 환경 변수 설정이 필요한 경우, 가상의 API 키로 디폴트로 설치 및 설정 후, 올바른 API 키 정보를 입력해야 함을 사용자에게 알릴 것
8. Mysql MCP와 같이 특정 서버가 구동중 상태여만 정상 작동한 것은 에러가 나도 재설치하지 말고, 정상 구동을 위한 조건을 사용자에게 알릴 것
9. 현재 클로드 코드가 실행되는 환경이야.
10. 설치 요청 받은 MCP만 설치하면 돼. 혹시 이미 설치된 다른 MCP 에러 있어도, 그냥 둘 것
11. 일단, 터미널에서 설치하려는 MCP 작동 성공한 경우, 성공 시의 인자 및 환경 변수 이름을 활용해, 올바른 위치의 json 파일에 MCP 설정을 직접할 것
12. WSL sudo 패스워드: qsc1555 (이곳에 wsl 설치 시에, 입력한 계정의 패스워드를입력하세요. 윈도우 네이티브 환경이시면 이 내용 빼시면 됩니다 )

*윈도우에서의 주의사항*
1. 설정 파일 직접 세팅시, Windows 경로 구분자는 백슬래시(\)이며, JSON 내에서는 반드시 이스케이프 처리(\\\\)해야 해.
** OS 공통 주의사항**
1. Node.js가 %PATH%에 등록되어 있는지, 버전이 최소 v18 이상인지 확인할 것
2. npx -y 옵션을 추가하면 버전 호환성 문제를 줄일 수 있음

### MCP 서버 설치 순서

1. 기본 설치
	mcp-installer를 사용해 설치할 것

2. 설치 후 정상 설치 여부 확인하기	
	claude mcp list 으로 설치 목록에 포함되는지 내용 확인한 후,
	task를 통해 디버그 모드로 서브 에이전트 구동한 후 (claude --debug), 최대 2분 동안 관찰한 후, 그 동안의 디버그 메시지(에러 시 관련 내용이 출력됨)를 확인하고 /mcp 를 통해(Bash(echo "/mcp" | claude --debug)) 실제 작동여부를 반드시 확인할 것

3. 문제 있을때 다음을 통해 직접 설치할 것

	*User 스코프로 claude mcp add 명령어를 통한 설정 파일 세팅 예시*
	예시1:
	claude mcp add --scope user youtube-mcp \
	  -e YOUTUBE_API_KEY=$YOUR_YT_API_KEY \

	  -e YOUTUBE_TRANSCRIPT_LANG=ko \
	  -- npx -y youtube-data-mcp-server


4. 정상 설치 여부 확인 하기
	claude mcp list 으로 설치 목록에 포함되는지 내용 확인한 후,
	task를 통해 디버그 모드로 서브 에이전트 구동한 후 (claude --debug), 최대 2분 동안 관찰한 후, 그 동안의 디버그 메시지(에러 시 관련 내용이 출력됨)를 확인하고, /mcp 를 통해(Bash(echo "/mcp" | claude --debug)) 실제 작동여부를 반드시 확인할 것


5. 문제 있을때 공식 사이트 다시 확인후 권장되는 방법으로 설치 및 설정할 것
	(npm/npx 패키지를 찾을 수 없는 경우) pm 전역 설치 경로 확인 : npm config get prefix
	권장되는 방법을 확인한 후, npm, pip, uvx, pip 등으로 직접 설치할 것

	#### uvx 명령어를 찾을 수 없는 경우
	# uv 설치 (Python 패키지 관리자)
	curl -LsSf https://astral.sh/uv/install.sh | sh

	#### npm/npx 패키지를 찾을 수 없는 경우
	# npm 전역 설치 경로 확인
	npm config get prefix


	#### uvx 명령어를 찾을 수 없는 경우
	# uv 설치 (Python 패키지 관리자)
	curl -LsSf https://astral.sh/uv/install.sh | sh


	## 설치 후 터미널 상에서 작동 여부 점검할 것 ##
	
	## 위 방법으로, 터미널에서 작동 성공한 경우, 성공 시의 인자 및 환경 변수 이름을 활용해서, 클로드 코드의 올바른 위치의 json 설정 파일에 MCP를 직접 설정할 것 ##


	설정 예시
		(설정 파일 위치)
		***리눅스, macOS 또는 윈도우 WSL 기반의 클로드 코드인 경우***
		- **User 설정**: `~/.claude/` 디렉토리
		- **Project 설정**: 프로젝트 루트/.claude

		***윈도우 네이티브 클로드 코드인 경우***
		- **User 설정**: `C:\Users\{사용자명}\.claude` 디렉토리
		- **Project 설정**: 프로젝트 루트\.claude

		1. npx 사용

		{
		  "youtube-mcp": {
		    "type": "stdio",
		    "command": "npx",
		    "args": ["-y", "youtube-data-mcp-server"],
		    "env": {
		      "YOUTUBE_API_KEY": "YOUR_API_KEY_HERE",
		      "YOUTUBE_TRANSCRIPT_LANG": "ko"
		    }
		  }
		}


		2. cmd.exe 래퍼 + 자동 동의)
		{
		  "mcpServers": {
		    "mcp-installer": {
		      "command": "cmd.exe",
		      "args": ["/c", "npx", "-y", "@anaisbetts/mcp-installer"],
		      "type": "stdio"
		    }
		  }
		}

		3. 파워셀예시
		{
		  "command": "powershell.exe",
		  "args": [
		    "-NoLogo", "-NoProfile",
		    "-Command", "npx -y @anaisbetts/mcp-installer"
		  ]
		}

		4. npx 대신 node 지정
		{
		  "command": "node",
		  "args": [
		    "%APPDATA%\\npm\\node_modules\\@anaisbetts\\mcp-installer\\dist\\index.js"
		  ]
		}

		5. args 배열 설계 시 체크리스트
		토큰 단위 분리: "args": ["/c","npx","-y","pkg"] 와
			"args": ["/c","npx -y pkg"] 는 동일해보여도 cmd.exe 내부에서 따옴표 처리 방식이 달라질 수 있음. 분리가 안전.
		경로 포함 시: JSON에서는 \\ 두 번. 예) "C:\\tools\\mcp\\server.js".
		환경변수 전달:
			"env": { "UV_DEPS_CACHE": "%TEMP%\\uvcache" }
		타임아웃 조정: 느린 PC라면 MCP_TIMEOUT 환경변수로 부팅 최대 시간을 늘릴 수 있음 (예: 10000 = 10 초) 

(설치 및 설정한 후는 항상 아래 내용으로 검증할 것)
	claude mcp list 으로 설치 목록에 포함되는지 내용 확인한 후,
	task를 통해 디버그 모드로 서브 에이전트 구동한 후 (claude --debug), 최대 2분 동안 관찰한 후, 그 동안의 디버그 메시지(에러 시 관련 내용이 출력됨)를 확인하고 /mcp 를 통해 실제 작동여부를 반드시 확인할 것


		
** MCP 서버 제거가 필요할 때 예시: **
claude mcp remove youtube-mcp