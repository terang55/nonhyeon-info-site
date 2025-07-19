/**
 * 햅틱 피드백 유틸리티
 * 모바일 디바이스에서 터치 피드백 제공
 */

export type HapticType = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error';

interface HapticPattern {
  duration: number;
  pattern?: number[];
}

const hapticPatterns: Record<HapticType, HapticPattern> = {
  light: { duration: 10 },
  medium: { duration: 20 },
  heavy: { duration: 30 },
  success: { duration: 15, pattern: [10, 50, 15] },
  warning: { duration: 25, pattern: [20, 100, 20] },
  error: { duration: 35, pattern: [30, 150, 30, 150, 30] }
};

/**
 * 햅틱 피드백 트리거
 * @param type 햅틱 피드백 타입
 * @param force 강제 실행 여부 (기본값: false)
 */
export const triggerHaptic = (type: HapticType, force: boolean = false): void => {
  // 모바일 환경에서만 실행 (데스크톱에서는 force=true일 때만)
  if (!force && !isMobileDevice()) {
    return;
  }

  const pattern = hapticPatterns[type];
  
  // Web Vibration API 지원 확인
  if ('vibrate' in navigator) {
    try {
      if (pattern.pattern) {
        navigator.vibrate(pattern.pattern);
      } else {
        navigator.vibrate(pattern.duration);
      }
    } catch (error) {
      console.warn('햅틱 피드백 실행 실패:', error);
    }
  }
};

/**
 * 모바일 디바이스 감지
 */
export const isMobileDevice = (): boolean => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
};

/**
 * 햅틱 피드백 지원 여부 확인
 */
export const isHapticSupported = (): boolean => {
  return 'vibrate' in navigator;
};

/**
 * 햅틱 피드백 설정 확인 및 권한 요청
 */
export const initializeHaptics = (): boolean => {
  if (!isHapticSupported()) {
    return false;
  }

  // 초기 테스트 진동으로 권한 확인
  try {
    navigator.vibrate(1);
    return true;
  } catch (error) {
    console.warn('햅틱 피드백 초기화 실패:', error);
    return false;
  }
};

/**
 * 컴포넌트용 햅틱 훅
 */
export const useHaptic = () => {
  const isSupported = isHapticSupported();
  const isMobile = isMobileDevice();

  const haptic = (type: HapticType, force?: boolean) => {
    triggerHaptic(type, force);
  };

  return {
    haptic,
    isSupported,
    isMobile
  };
};