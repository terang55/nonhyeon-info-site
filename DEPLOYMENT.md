# 배포 환경변수 설정

## Vercel 환경변수 설정

배포 시 다음 환경변수를 Vercel 대시보드에서 설정하세요:

### 1. Vercel 대시보드 접속
- 프로젝트 → Settings → Environment Variables

### 2. 환경변수 추가
```
Name: OPENWEATHER_API_KEY
Value: fec0e5d8daec1747581d667dc08e95cb
Environment: Production, Preview, Development (모두 체크)
```

### 3. 재배포
- 환경변수 설정 후 자동으로 재배포됩니다
- 또는 수동으로 "Redeploy" 버튼 클릭

## 로컬 개발 환경

로컬에서 개발할 때는 `.env.local` 파일 생성:

```bash
OPENWEATHER_API_KEY=fec0e5d8daec1747581d667dc08e95cb
```

## API 키 정보

- **Provider**: OpenWeatherMap
- **Plan**: Free (하루 1000회 호출 제한)
- **Features**: 현재 날씨 + 5일 예보
- **Location**: 인천 남동구 논현동 (37.3894, 126.7317) 