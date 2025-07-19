/**
 * 동적 임포트를 위한 MedicalWidget 래퍼
 */

import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';

// 동적 임포트로 MedicalWidget 로드
const MedicalWidget = dynamic(() => import('./MedicalWidget'), {
  loading: () => (
    <div className="text-center py-8">
      <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
      <p className="mt-2 text-sm text-gray-600">의료기관 정보를 불러오는 중...</p>
    </div>
  ),
  ssr: false // 클라이언트 사이드에서만 로드
});

interface DynamicMedicalWidgetProps {
  initialType: 'hospital' | 'pharmacy';
}

export default function DynamicMedicalWidget({ initialType }: DynamicMedicalWidgetProps) {
  return (
    <Suspense fallback={
      <div className="text-center py-8">
        <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        <p className="mt-2 text-sm text-gray-600">의료기관 정보를 불러오는 중...</p>
      </div>
    }>
      <MedicalWidget initialType={initialType} />
    </Suspense>
  );
}