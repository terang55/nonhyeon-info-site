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

  const navItems: NavItem[] = useMemo(() => [
    { icon: '🏠', label: '홈', path: '/' },
    { icon: '🏥', label: '의료', path: '/', isCategory: true, categoryName: '병원' },
    { icon: '🏢', label: '부동산', path: '/realestate' },
    { icon: '🎓', label: '학원', path: '/academy' },
    { icon: '🚇', label: '교통', path: '/subway' }
  ], []);

  // 현재 경로에 따라 활성 아이템 설정
  useEffect(() => {
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
  }, [pathname, navItems]);

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

  return (
    <>
      {/* 하단 네비게이션 바 */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 md:hidden">
        <div className="flex justify-around items-center py-2 pb-safe">
          {navItems.map((item) => (
            <button
              key={item.path + (item.categoryName || '')}
              onClick={() => handleNavClick(item)}
              className={`flex flex-col items-center py-2 px-3 transition-colors duration-200 ${
                isActive(item) 
                  ? 'text-blue-600' 
                  : 'text-gray-500 hover:text-gray-700'
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
      <div className="h-16 md:hidden" aria-hidden="true"></div>
    </>
  );
} 