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
    <BottomNavigation
      items={ITEMS}
      activeIndex={activeIndex}
      onSelect={(index) => router.push(ITEMS[index].href)}
    />
  );
}
