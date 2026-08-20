'use client';

/**
 * App-level wiring around the design system's `BottomNavigation`. The `.pen`
 * pages hide the 검색·저장 items, leaving the two routes the app actually has.
 */
import { usePathname, useRouter } from 'next/navigation';

import { BottomNavigation } from '@/components';

const ITEMS = [
  { icon: 'home', label: '홈', href: '/' },
  { icon: 'user', label: '마이', href: '/my' },
];

export function AppBottomNav() {
  const router = useRouter();
  const pathname = usePathname();
  const activeIndex = pathname.startsWith('/my') ? 1 : 0;

  return (
    // 앱 셸(h-dvh + main 스크롤) 밖의 고정 슬롯에 놓이므로 별도 포지셔닝이 필요 없다.
    // 웹(md+)에서는 어느 페이지든 바텀 내비를 쓰지 않는다 — 헤더 쪽 진입점이 대신한다.
    <BottomNavigation
      items={ITEMS}
      activeIndex={activeIndex}
      onSelect={(index) => router.push(ITEMS[index].href)}
      className="md:hidden"
    />
  );
}
