import type { Metadata } from 'next';

import { RegisterView } from './register-view';

export const metadata: Metadata = { title: '맛집 등록 | 구로 맛집 지도' };

export default function RegisterPage() {
  return <RegisterView />;
}
