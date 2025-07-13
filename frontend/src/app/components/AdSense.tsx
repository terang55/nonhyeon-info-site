'use client';

import { useEffect } from 'react';

interface AdSenseProps {
  slot: string;
  format?: 'auto' | 'rectangle' | 'vertical' | 'horizontal';
  responsive?: boolean;
  style?: React.CSSProperties;
  className?: string;
}

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

export default function AdSense({ 
  slot, 
  format = 'auto', 
  responsive = true, 
  style,
  className = ''
}: AdSenseProps) {
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (err) {
      console.error('AdSense error:', err);
    }
  }, []);

  return (
    <div className={`adsense-container ${className}`} style={style}>
      <ins 
        className="adsbygoogle"
        style={{ 
          display: 'block',
          ...style 
        }}
        data-ad-client="ca-pub-2592538242403472"
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive ? "true" : "false"}
      />
    </div>
  );
}

// 미리 정의된 광고 크기별 컴포넌트들
export function AdSenseBanner({ slot, className }: { slot: string; className?: string }) {
  return (
    <AdSense 
      slot={slot}
      format="auto"
      className={`w-full ${className || ''}`}
      style={{ minHeight: '90px' }}
    />
  );
}

export function AdSenseRectangle({ slot, className }: { slot: string; className?: string }) {
  return (
    <AdSense 
      slot={slot}
      format="rectangle"
      className={`mx-auto ${className || ''}`}
      style={{ width: '300px', height: '250px' }}
    />
  );
}

export function AdSenseSkyscraper({ slot, className }: { slot: string; className?: string }) {
  return (
    <AdSense 
      slot={slot}
      format="vertical"
      className={`${className || ''}`}
      style={{ width: '160px', height: '600px' }}
    />
  );
}

export function AdSenseInFeed({ slot, className }: { slot: string; className?: string }) {
  return (
    <div className={`bg-gray-50 border border-gray-200 rounded-lg p-4 my-6 ${className || ''}`}>
      <div className="text-xs text-gray-500 mb-2 text-center">광고</div>
      <AdSense 
        slot={slot}
        format="auto"
        style={{ minHeight: '100px' }}
      />
    </div>
  );
} 