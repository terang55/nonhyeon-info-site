'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';

interface NavItem {
  icon: string;
  label: string;
  path: string;
  isCategory?: boolean;
  categoryName?: string;
}

export default function BottomNavigation() {
  const router = useRouter();
  const pathname = usePathname();
  const [activeItem, setActiveItem] = useState<string>('');
  const [mounted, setMounted] = useState(false);

  const navItems: NavItem[] = useMemo(() => [
    { icon: '🏠', label: '홈', path: '/' },
    { icon: '📋', label: '가이드', path: '/guides' },
    { icon: '🏢', label: '부동산', path: '/realestate' },
    { icon: '🎓', label: '학원', path: '/academy' },
    { icon: '🚇', label: '교통', path: '/subway' }
  ], []);

  // 클라이언트 마운트 감지
  useEffect(() => {
    setMounted(true);
  }, []);

  // 현재 경로에 따라 활성 아이템 설정
  useEffect(() => {
    if (!mounted) return;
    
    const currentItem = navItems.find(item => {
      if (item.path === pathname) return true;
      if (pathname === '/' && item.isCategory) {
        // URL 파라미터에서 카테고리 확인
        const urlParams = new URLSearchParams(window.location.search);
        const category = urlParams.get('category');
        return category === item.categoryName;
      }
      return false;
    });
    
    setActiveItem(currentItem?.path + (currentItem?.categoryName || '') || '/');
  }, [pathname, navItems, mounted]);

  const handleNavClick = (item: NavItem) => {
    if (item.isCategory && item.categoryName) {
      // 카테고리 네비게이션의 경우 홈으로 이동하면서 카테고리 파라미터 추가
      router.push(`/?category=${item.categoryName}`);
      setActiveItem(item.path + item.categoryName);
    } else {
      router.push(item.path);
      setActiveItem(item.path);
    }
  };

  const isActive = (item: NavItem) => {
    const itemKey = item.path + (item.categoryName || '');
    return activeItem === itemKey;
  };

  // SSR 중에는 빈 컴포넌트 렌더링하여 Hydration 에러 방지
  if (!mounted) {
    return (
      <>
        {/* 하단 네비게이션 바 - 로딩 중 */}
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 md:hidden">
          <div className="flex justify-around items-center py-2 pb-safe px-2">
            {/* 로딩 스켈레톤 */}
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className="flex flex-col items-center py-3 px-3 min-h-[56px] min-w-[56px] justify-center rounded-lg"
              >
                <div className="w-6 h-6 bg-gray-200 rounded mb-1"></div>
                <div className="w-8 h-3 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </nav>
        {/* 하단 네비게이션 바 공간 확보를 위한 패딩 */}
        <div className="h-20 md:hidden" aria-hidden="true"></div>
      </>
    );
  }

  return (
    <>
      {/* 하단 네비게이션 바 */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 md:hidden">
        <div className="flex justify-around items-center py-2 pb-safe px-2">
          {navItems.map((item) => (
            <button
              key={item.path + (item.categoryName || '')}
              onClick={() => handleNavClick(item)}
              className={`flex flex-col items-center py-3 px-3 transition-colors duration-200 min-h-[56px] min-w-[56px] justify-center rounded-lg ${
                isActive(item) 
                  ? 'text-blue-600 bg-blue-50' 
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
              aria-label={`${item.label} 페이지로 이동`}
            >
              <span className="text-xl mb-1">{item.icon}</span>
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* 하단 네비게이션 바 공간 확보를 위한 패딩 */}
      <div className="h-20 md:hidden" aria-hidden="true"></div>
    </>
  );
} 