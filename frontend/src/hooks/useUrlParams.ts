/**
 * URL 파라미터 관리를 위한 커스텀 훅
 */

import { useEffect } from 'react';

interface UseUrlParamsReturn {
  setupExternalRedirect: () => void;
}

export function useUrlParams(): UseUrlParamsReturn {
  // RSS 리디렉션 처리
  const setupExternalRedirect = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const externalUrl = urlParams.get('external');
    
    if (externalUrl) {
      // 3초 후 외부 링크로 리디렉션
      const timer = setTimeout(() => {
        window.open(decodeURIComponent(externalUrl), '_blank', 'noopener,noreferrer');
        // URL에서 파라미터 제거
        window.history.replaceState({}, document.title, window.location.pathname);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  };

  useEffect(() => {
    const cleanup = setupExternalRedirect();
    return cleanup;
  }, []);

  return {
    setupExternalRedirect,
  };
}