import type { Metadata } from 'next';

import { MyView } from './my-view';

export const metadata: Metadata = { title: '마이페이지 | 구로 맛집 지도' };

export default function MyPage() {
  return <MyView />;
}
