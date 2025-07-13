# 🕐 인천논현라이프 - 크롤러 스케줄러

개선된 크롤러(`enhanced_crawler.py`)를 정기적으로 자동 실행하는 스케줄러입니다.

## 📋 스케줄링 계획

| 시간 | 작업 | 설명 |
|------|------|------|
| **매일 06:00** | 전체 크롤링 | 뉴스 + 블로그 + 유튜브 전체 수집 |
| **매일 20:00** | 전체 크롤링 | 뉴스 + 블로그 + 유튜브 전체 수집 |

## 🚀 사용 방법

### 1. 간편 실행 (Windows)

#### 스케줄러 시작
```bash
# 배치 파일로 실행 (더블클릭)
start_scheduler.bat
```

#### 즉시 크롤링
```bash
# 배치 파일로 실행 (더블클릭)
crawl_now.bat
```

#### 데이터 동기화
```bash
# 프론트엔드로 데이터 동기화 (더블클릭)
sync_now.bat
```

### 2. 명령어 실행

#### 스케줄러 데몬 모드
```bash
python enhanced_scheduler.py --daemon
```

#### 즉시 크롤링 실행
```bash
python enhanced_scheduler.py --now
```

#### 대화형 메뉴
```bash
python enhanced_scheduler.py
```

#### 데이터 동기화
```bash
# 즉시 동기화
python sync_to_frontend.py --sync

# 동기화 상태 확인
python sync_to_frontend.py --status
```

## 📊 크롤링 범위

### 일반 크롤링 키워드
- 인천 논현동
- 인천 논현지구
- 인천 논현고잔동
- 인천 논현동 맛집
- 인천 논현동 카페
- 인천 논현동 부동산
- 인천 남동구 논현동
- 인천 호구포
- 소래포구
- 에코메트로

### 크롤링 대상
모든 키워드에 대해 뉴스, 블로그, 유튜브 컨텐츠를 수집합니다.

## 📁 데이터 저장 및 동기화

### 크롤링 데이터 저장
```
data/
└── enhanced_news/
    ├── 인천 논현동_enhanced_news_20250627_063816.json
    ├── 인천 논현지구_enhanced_news_20250627_063800.json
    └── ... (키워드별 JSON 파일)
```

### 프론트엔드 동기화
크롤링 완료 후 최신 데이터가 자동으로 다음 위치에 동기화됩니다:
```
frontend/public/data/enhanced_news/
├── 키워드별 최신 JSON 파일들
└── sync_summary.json (동기화 상태 정보)
```

## 📝 로그 관리

- 위치: `data/logs/enhanced_scheduler_YYYYMMDD.log`
- 자동 로테이션: 매일
- 보관 기간: 30일

## ⚙️ 설정 변경

`config.py` 파일에서 다음 항목들을 수정할 수 있습니다:

- `SEARCH_KEYWORDS`: 크롤링 키워드 목록
- `DELAY_BETWEEN_REQUESTS`: 요청 간 지연 시간
- `LOG_LEVEL`: 로그 레벨 설정

## 🔧 문제 해결

### 웹드라이버 오류
```bash
# ChromeDriver 자동 설치
pip install webdriver-manager
```

### 패키지 설치 오류
```bash
# 필수 패키지 재설치
pip install -r requirements.txt
```

### 권한 오류 (Windows)
- 관리자 권한으로 명령 프롬프트 실행
- 또는 배치 파일을 관리자 권한으로 실행

## 💡 추천 운영 방법

1. **개발/테스트**: `crawl_now.bat`로 즉시 실행해서 테스트
2. **운영 환경**: `start_scheduler.bat`로 스케줄러 시작
3. **서버 환경**: `python enhanced_scheduler.py --daemon`으로 백그라운드 실행

## 📈 모니터링

### 데이터 확인
```bash
python check_enhanced_data.py
```

### 데이터 분석
```bash
python data_analyzer.py
```

## 🛑 종료 방법

- **스케줄러 중지**: `Ctrl + C`
- **완전 종료**: 터미널 또는 명령 프롬프트 창 닫기

---

**주의사항**: 스케줄러는 24시간 실행되므로 컴퓨터를 계속 켜두어야 합니다. 
서버 환경에서 운영하는 것을 권장합니다. 