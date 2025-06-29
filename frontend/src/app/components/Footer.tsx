import React from 'react';

export default function Footer() {
  return (
    <footer className="mt-12 py-8 border-t text-center text-xs sm:text-sm text-gray-500 bg-white" aria-label="사이트 푸터">
      <div className="max-w-2xl mx-auto space-y-4">
        {/* 브랜드 및 설명 */}
        <div className="flex flex-col items-center space-y-1">
          <span className="text-2xl">🏙️</span>
          <div className="text-lg sm:text-xl font-bold text-gray-900">인천논현라이프</div>
          <div className="text-sm text-gray-400">인천 남동구 논현동 지역 정보</div>
          <p className="text-sm text-gray-600 text-center max-w-md">
            논현동 주민들을 위한 실시간 지역 정보를 제공합니다. 뉴스, 맛집, 카페, 부동산, 육아 정보를 한눈에 확인하세요.
          </p>
        </div>
        {/* 주요 지역 */}
        <div>
          <h3 className="text-xs font-semibold text-gray-700 mb-1">주요 지역</h3>
          <ul className="flex flex-wrap justify-center gap-3 text-base">
            <li>📍 논현동</li>
            <li>🚇 에코메트로</li>
            <li>🦐 소래포구</li>
            <li>⚓ 호구포</li>
            <li>🏗️ 논현지구</li>
          </ul>
        </div>
        {/* 비즈니스 문의 */}
        <div>
          <h3 className="text-xs font-semibold text-gray-700 mb-1">비즈니스 문의</h3>
          <div className="flex flex-col items-center gap-1">
            <span className="text-base">📧 <a href="mailto:rainbowcr55@gmail.com" className="underline hover:text-blue-600">rainbowcr55@gmail.com</a></span>
            <span className="text-base">💼 제휴 및 사이트 문의</span>
          </div>
        </div>
        {/* 저작권 및 정책 */}
        <div className="flex flex-col items-center gap-1 mt-4">
          <span className="text-xs text-gray-400">© 2025 인천논현라이프. 모든 권리 보유.</span>
          <div className="flex items-center gap-2">
            <a href="/privacy" className="underline hover:text-blue-600">개인정보처리방침</a>
            <span className="text-gray-300">|</span>
            <a href="/terms" className="underline hover:text-blue-600">이용약관</a>
          </div>
        </div>
      </div>
    </footer>
  );
} 