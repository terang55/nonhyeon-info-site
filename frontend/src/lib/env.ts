/**
 * 환경변수 검증 및 관리 유틸리티
 * 필수 환경변수 검증과 타입 안전성을 제공합니다.
 */

interface EnvConfig {
  // API 키들
  OPENWEATHER_API_KEY?: string;
  SEOUL_OPEN_API_KEY?: string;
  KAKAO_API_KEY?: string;
  MOLIT_API_KEY?: string;
  HIRA_SERVICE_KEY?: string;
  ACADEMY_API_KEY?: string;
  
  // Next.js 설정
  NODE_ENV: string;
  NEXT_PUBLIC_SITE_URL?: string;
  
  // 선택적 설정
  DEBUG?: string;
  LOG_LEVEL?: string;
}

interface ValidationResult {
  isValid: boolean;
  missingVars: string[];
  warnings: string[];
}

/**
 * 필수 환경변수 목록
 * 개발/프로덕션 환경에 따라 다른 필수 변수 설정
 */
const getRequiredEnvVars = (): string[] => {
  const common = ['NODE_ENV'];
  
  if (process.env.NODE_ENV === 'production') {
    return [
      ...common,
      'OPENWEATHER_API_KEY',
      'MOLIT_API_KEY',
      'NEXT_PUBLIC_SITE_URL'
    ];
  }
  
  // 개발 환경에서는 덜 엄격하게
  return common;
};

/**
 * 권장 환경변수 목록 (없어도 동작하지만 기능이 제한됨)
 */
const getRecommendedEnvVars = (): string[] => [
  'OPENWEATHER_API_KEY',  // 날씨 정보
  'SEOUL_OPEN_API_KEY',   // 대중교통 정보  
  'KAKAO_API_KEY',        // 지도 서비스
  'MOLIT_API_KEY',        // 부동산 정보
  'HIRA_SERVICE_KEY',     // 의료기관 정보
  'ACADEMY_API_KEY',      // 학원 정보
];

/**
 * 환경변수 유효성 검증
 */
export function validateEnvVars(): ValidationResult {
  const requiredVars = getRequiredEnvVars();
  const recommendedVars = getRecommendedEnvVars();
  const missingVars: string[] = [];
  const warnings: string[] = [];

  // 필수 환경변수 검증
  for (const varName of requiredVars) {
    const value = process.env[varName];
    if (!value || value.trim() === '') {
      missingVars.push(varName);
    }
  }

  // 권장 환경변수 검증 (경고만)
  for (const varName of recommendedVars) {
    const value = process.env[varName];
    if (!value || value.trim() === '') {
      warnings.push(`${varName} 환경변수가 설정되지 않아 해당 기능이 제한됩니다.`);
    }
  }

  // API 키 형식 검증
  const apiKeys = [
    { name: 'OPENWEATHER_API_KEY', pattern: /^[a-f0-9]{32}$/, description: 'OpenWeather API 키' },
    { name: 'MOLIT_API_KEY', pattern: /^[A-Za-z0-9+/=]{50,}$/, description: '국토교통부 API 키' }
  ];

  for (const { name, pattern, description } of apiKeys) {
    const value = process.env[name];
    if (value && !pattern.test(value)) {
      warnings.push(`${description}(${name})의 형식이 올바르지 않을 수 있습니다.`);
    }
  }

  return {
    isValid: missingVars.length === 0,
    missingVars,
    warnings
  };
}

/**
 * 환경변수 안전하게 가져오기
 */
export function getEnvVar(name: keyof EnvConfig, defaultValue?: string): string {
  const value = process.env[name];
  
  if (!value) {
    if (defaultValue !== undefined) {
      return defaultValue;
    }
    throw new Error(`환경변수 ${name}이(가) 설정되지 않았습니다.`);
  }
  
  return value;
}

/**
 * 환경변수 존재 여부 확인
 */
export function hasEnvVar(name: keyof EnvConfig): boolean {
  const value = process.env[name];
  return !!(value && value.trim() !== '');
}

/**
 * 환경별 설정 가져오기
 */
export function getEnvironmentConfig() {
  const env = process.env.NODE_ENV || 'development';
  
  return {
    isDevelopment: env === 'development',
    isProduction: env === 'production',
    isTest: env === 'test',
    
    // 기능별 활성화 상태
    features: {
      weather: hasEnvVar('OPENWEATHER_API_KEY'),
      realEstate: hasEnvVar('MOLIT_API_KEY'),
      maps: hasEnvVar('KAKAO_API_KEY'),
      transit: hasEnvVar('SEOUL_OPEN_API_KEY'),
      medical: hasEnvVar('HIRA_SERVICE_KEY'),
      academy: hasEnvVar('ACADEMY_API_KEY'),
    },
    
    // 디버그 설정
    debug: process.env.DEBUG === 'true',
    logLevel: process.env.LOG_LEVEL || 'info',
  };
}

/**
 * 환경변수 검증 결과 출력
 */
export function printEnvValidation(): void {
  const validation = validateEnvVars();
  const config = getEnvironmentConfig();
  
  console.log('\n🔧 환경변수 검증 결과:');
  console.log(`📍 환경: ${process.env.NODE_ENV}`);
  
  if (validation.isValid) {
    console.log('✅ 모든 필수 환경변수가 설정되었습니다.');
  } else {
    console.log('❌ 필수 환경변수가 누락되었습니다:');
    validation.missingVars.forEach(varName => {
      console.log(`   - ${varName}`);
    });
  }
  
  if (validation.warnings.length > 0) {
    console.log('\n⚠️  경고사항:');
    validation.warnings.forEach(warning => {
      console.log(`   - ${warning}`);
    });
  }
  
  console.log('\n🎯 활성화된 기능:');
  Object.entries(config.features).forEach(([feature, enabled]) => {
    const status = enabled ? '✅' : '❌';
    console.log(`   ${status} ${feature}`);
  });
  
  console.log(''); // 빈 줄
}

/**
 * 개발 환경에서만 환경변수 검증 실행
 */
if (process.env.NODE_ENV === 'development') {
  // 모듈 로드 시 자동 검증 (개발 환경만)
  const validation = validateEnvVars();
  if (!validation.isValid || validation.warnings.length > 0) {
    printEnvValidation();
  }
}