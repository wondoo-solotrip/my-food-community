import type { Metadata } from 'next';

import { MyView } from './my-view';

export const metadata: Metadata = { title: '마이페이지 | 구로 맛집 지도' };

/** `?tab=` 딥링크 — 결제 완료 페이지의 "결제 내역 보기"가 payments로 보낸다. */
const TAB_INDEX: Record<string, number> = { posts: 0, payments: 1, canceled: 2 };

interface MyPageProps {
  searchParams: Promise<{ tab?: string }>;
}

export default async function MyPage({ searchParams }: MyPageProps) {
  const { tab } = await searchParams;
  return <MyView initialTab={TAB_INDEX[tab ?? ''] ?? 0} />;
}
