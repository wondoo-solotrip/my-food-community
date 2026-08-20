import type { Metadata } from 'next';

import { PaymentCompleteView } from './payment-complete-view';

export const metadata: Metadata = { title: '결제 완료 | 구로 맛집 지도' };

interface PaymentCompletePageProps {
  /** [id]는 포트원 paymentId(= 원장 transaction_key). */
  params: Promise<{ id: string }>;
  /** 모바일 리디렉션 플로우에서 포트원이 붙여주는 결과 쿼리 — code가 있으면 실패. */
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function PaymentCompletePage({
  params,
  searchParams,
}: PaymentCompletePageProps) {
  const { id } = await params;
  const query = await searchParams;
  const code = typeof query.code === 'string' ? query.code : undefined;
  const message = typeof query.message === 'string' ? query.message : undefined;

  return (
    <PaymentCompleteView
      id={id}
      initialError={code ? (message ?? '결제에 실패했어요. 다시 시도해주세요.') : undefined}
    />
  );
}
