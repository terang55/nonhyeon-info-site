# 🤖 GitHub Actions 자동 크롤링 시스템

## 📋 워크플로우 설명

### 🕒 `auto-crawl.yml` - 정기 자동 실행
- **실행 시간**: 매일 05:00, 13:00, 18:00 (KST) - 하루 3번
- **기능**: 뉴스/블로그/유튜브 전체 크롤링 + 동기화 + 자동 커밋
- **소요 시간**: 약 20-40분

### 🎯 `manual-crawl.yml` - 수동 실행
- **실행**: GitHub Actions 탭에서 수동 실행
- **옵션**: 플랫폼 선택, 테스트 모드
- **소요 시간**: 약 15-25분

### 🔧 `crawl-recovery.yml` - 복구 및 백업
- **실행**: 문제 발생 시 수동 실행
- **기능**: 백업, 강제 크롤링, 중복 정리, 동기화만 실행
- **소요 시간**: 작업에 따라 5-30분

## 🚀 사용 방법

### 1. 자동 실행 확인
GitHub Actions 탭에서 자동 실행 상태를 확인할 수 있습니다.

### 2. 수동 실행
1. GitHub 저장소 → Actions 탭
2. "🎯 수동 크롤링 (빠른 실행)" 선택
3. "Run workflow" 클릭
4. 옵션 선택 후 실행

### 3. 실행 결과 확인
- **성공**: 자동으로 새 커밋이 생성됨
- **실패**: Actions 탭에서 로그 확인 가능
- **데이터**: `data/enhanced_news/`와 `frontend/public/data/enhanced_news/`에 저장

## 🔍 모니터링

### 성공/실패 확인
```bash
# 최근 커밋 확인
git log --oneline -5

# 데이터 파일 확인
ls -la data/enhanced_news/
ls -la frontend/public/data/enhanced_news/
```

### 로그 확인
- GitHub Actions 탭에서 각 단계별 상세 로그 확인 가능
- 실패 시 정확한 오류 메시지 표시

## ⚙️ 설정 변경

### 크롤링 시간 변경
`auto-crawl.yml` 파일의 cron 설정 수정:
```yaml
schedule:
  - cron: '0 20 * * *'  # 05:00 KST (오전)
  - cron: '0 4 * * *'   # 13:00 KST (오후)
  - cron: '0 9 * * *'   # 18:00 KST (저녁)
```

### 타임아웃 변경
각 워크플로우의 `timeout-minutes` 값 조정

## 🔐 보안

- **토큰**: GitHub 자동 제공 토큰 사용
- **권한**: 저장소 읽기/쓰기만 필요
- **환경**: Ubuntu 최신 버전 사용
- **의존성**: 공식 패키지만 사용

## 📊 장점

### 🆚 배치 파일 vs GitHub Actions

| 항목 | 배치 파일 | GitHub Actions |
|------|-----------|----------------|
| 실행 환경 | 로컬 Windows | 클라우드 Ubuntu |
| 자동화 | 수동 실행 | 완전 자동화 |
| 모니터링 | 콘솔 로그 | 웹 인터페이스 |
| 안정성 | 로컬 의존적 | 클라우드 안정성 |
| 확장성 | 제한적 | 무제한 확장 |
| 비용 | 전력 소모 | GitHub 무료 |

### ✅ 주요 장점
1. **완전 자동화**: 수동 개입 불필요
2. **안정성**: 클라우드 환경의 높은 가용성
3. **모니터링**: 웹 인터페이스로 쉬운 관리
4. **확장성**: 필요시 추가 기능 쉽게 구현
5. **무료**: GitHub 제공 무료 사용량 활용

## 🛠️ 문제 해결

### 자주 발생하는 문제

1. **크롤링 실패**
   - 원인: 웹사이트 구조 변경, 네트워크 문제
   - 해결: `crawl-recovery.yml`로 강제 크롤링 실행

2. **동기화 실패**
   - 원인: 파일 권한, 경로 문제
   - 해결: `crawl-recovery.yml`로 동기화만 실행

3. **커밋 실패**
   - 원인: Git 설정, 권한 문제
   - 해결: Actions 로그 확인 후 수동 푸시

### 복구 방법
```bash
# 로컬에서 복구 시
git pull origin main
cd crawler
python run_platform_keywords_crawler.py
python sync_to_frontend.py --sync
```

## 📞 지원

문제 발생 시:
1. GitHub Actions 탭에서 로그 확인
2. 복구 워크플로우 실행
3. 필요시 수동 실행으로 테스트