# 🔒 보안 가이드라인

## 📋 목차
- [환경변수 보안](#환경변수-보안)
- [API 키 관리](#api-키-관리)
- [배포 보안](#배포-보안)
- [데이터 보호](#데이터-보호)
- [코드 보안](#코드-보안)
- [취약점 신고](#취약점-신고)

## 🔐 환경변수 보안

### ✅ 올바른 방법
```bash
# .env.local 또는 .env (로컬 개발용)
OPENWEATHER_API_KEY=실제_API_키_값
MOLIT_API_KEY=실제_국토교통부_API_키

# Vercel 환경변수 (프로덕션용)
# Vercel 대시보드에서 Environment Variables 설정
```

### ❌ 위험한 방법 (절대 금지)
```javascript
// ❌ 코드에 직접 하드코딩
const API_KEY = 'abc123def456';

// ❌ 기본값으로 실제 키 제공
const API_KEY = process.env.API_KEY || 'real_api_key_here';

// ❌ 공개 저장소에 .env 파일 커밋
```

### 🛡️ 환경변수 검증
```javascript
// ✅ 필수 환경변수 검증
if (!process.env.MOLIT_API_KEY) {
  throw new Error('MOLIT_API_KEY is required');
}
```

## 🔑 API 키 관리

### 1. API 키 발급 및 관리
- **최소 권한 원칙**: 필요한 권한만 부여
- **정기적 갱신**: 3-6개월마다 키 교체
- **사용량 모니터링**: 예상치 못한 사용량 급증 감지

### 2. API 키별 보안 수준
| API | 민감도 | 관리 방법 |
|-----|--------|-----------|
| 국토교통부 (MOLIT) | 🔴 High | 서버 전용, 사용량 제한 |
| OpenWeather | 🟡 Medium | 클라이언트 노출 가능, 도메인 제한 |
| 카카오 지도 | 🟡 Medium | 클라이언트 노출 가능, 도메인 제한 |

### 3. API 키 보호 방법
```javascript
// ✅ 서버 사이드에서만 사용
const sensitiveApiKey = process.env.SENSITIVE_API_KEY;

// ✅ 클라이언트 사이드 노출용 (NEXT_PUBLIC_ 접두사)
const publicApiKey = process.env.NEXT_PUBLIC_MAP_API_KEY;
```

## 🚀 배포 보안

### Vercel 환경 설정
1. **Environment Variables 설정**
   - Production, Preview, Development 환경별 분리
   - 민감한 키는 Production만 설정

2. **도메인 보안**
   ```
   # vercel.json 보안 헤더 설정
   {
     "headers": [
       {
         "source": "/(.*)",
         "headers": [
           { "key": "X-Frame-Options", "value": "DENY" },
           { "key": "X-Content-Type-Options", "value": "nosniff" },
           { "key": "Referrer-Policy", "value": "origin-when-cross-origin" }
         ]
       }
     ]
   }
   ```

### Git 보안
```bash
# .gitignore에 민감한 파일 추가
.env
.env.local
.env.production
*.log
/data/logs/*
```

## 🛡️ 데이터 보호

### 1. 크롤링 데이터 보안
- **개인정보 제거**: 전화번호, 이메일 등 자동 마스킹
- **데이터 암호화**: 민감한 정보는 암호화 저장
- **접근 제어**: 관리자만 원본 데이터 접근 가능

### 2. 사용자 데이터
```javascript
// ✅ 입력값 검증 및 새니타이징
import { sanitize } from 'isomorphic-dompurify';

const cleanInput = sanitize(userInput);
```

### 3. 파일 업로드 보안
- **파일 타입 검증**: 허용된 확장자만 업로드
- **파일 크기 제한**: DoS 공격 방지
- **바이러스 스캔**: 업로드된 파일 검사

## 💻 코드 보안

### 1. 의존성 관리
```bash
# 정기적 보안 감사
npm audit
npm audit fix

# 의존성 업데이트
npm update
```

### 2. TypeScript 보안
```typescript
// ✅ 타입 안전성 확보
interface ApiResponse {
  data: unknown; // any 대신 unknown 사용
}

// ✅ 입력값 타입 검증
function validateInput(input: unknown): input is string {
  return typeof input === 'string' && input.length > 0;
}
```

### 3. XSS 방지
```jsx
// ✅ React의 기본 XSS 보호 활용
<div>{userContent}</div>

// ✅ HTML을 렌더링해야 하는 경우
<div dangerouslySetInnerHTML={{ __html: sanitizedHtml }} />
```

## 🚨 취약점 신고

### 보안 문제 발견 시
1. **즉시 신고**: [rainbowcr55@gmail.com](mailto:rainbowcr55@gmail.com)
2. **상세 정보 포함**:
   - 취약점 유형
   - 재현 방법
   - 잠재적 영향
   - 제안하는 해결책

### 신고 시 유의사항
- 🔒 **기밀 유지**: 공개적으로 취약점 공개 금지
- ⏰ **신속 대응**: 24시간 내 초기 응답
- 🤝 **협력**: 해결책 논의 및 테스트 협조

## 📊 보안 체크리스트

### 개발 환경
- [ ] `.env` 파일이 `.gitignore`에 포함됨
- [ ] 하드코딩된 API 키 없음
- [ ] 모든 환경변수에 검증 로직 존재
- [ ] `npm audit` 정기 실행

### 프로덕션 환경
- [ ] Vercel 환경변수 올바르게 설정
- [ ] HTTPS 강제 적용
- [ ] 보안 헤더 설정 완료
- [ ] API 사용량 모니터링 활성화

### 코드 품질
- [ ] TypeScript 엄격 모드 사용
- [ ] ESLint 보안 규칙 활성화
- [ ] 사용자 입력값 검증 및 새니타이징
- [ ] 에러 메시지에 민감 정보 미포함

---

> ⚠️ **중요**: 이 가이드라인을 준수하여 사용자와 시스템을 보호하는 것은 모든 기여자의 책임입니다.