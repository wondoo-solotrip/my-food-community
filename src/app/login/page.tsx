import type { Metadata } from 'next';

import { LoginView } from './login-view';

export const metadata: Metadata = { title: '로그인 | 구로 맛집 지도' };

export default function LoginPage() {
  return <LoginView />;
}
