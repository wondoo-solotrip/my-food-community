'use client';

/**
 * 17 Payment Complete — design.pen `17 Payment Complete`. 규칙: rules/payment.md (SSOT).
 *
 * [id]는 포트원 paymentId. 진입하면 BFF(POST /api/payments/complete)로 결제를
 * 검증·기록하고 영수증을 받아 그린다 — 데스크톱(프로미스)·모바일(리디렉션)
 * 플로우가 모두 이 페이지로 모이고, BFF가 멱등이라 새로고침해도 안전하다.
 * 리디렉션 실패(code 쿼리)는 page가 initialError로 넘겨준다.
 * Storybook은 initialReceipt·initialError로 상태를 주입한다.
 */
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { Button, EmptyState, Icon, Spinner } from '@/components';
import {
  EVENT_CAMPAIGN,
  formatPaymentDateTime,
  formatPrice,
  type PaymentReceipt,
} from '@/lib/events';

export interface PaymentCompleteViewProps {
  /** 포트원 paymentId(= 원장 transaction_key). */
  id: string;
  /** Storybook에서 영수증을 주입한다. 앱에서는 생략(BFF 검증 결과 사용). */
  initialReceipt?: PaymentReceipt;
  /** 리디렉션 실패 문구(page가 전달) 또는 Storybook 실패 상태 주입. */
  initialError?: string;
}

export function PaymentCompleteView({
  id,
  initialReceipt,
  initialError,
}: PaymentCompleteViewProps) {
  const router = useRouter();
  // receipt가 undefined이고 error도 없으면 서버 검증이 진행 중인 상태다.
  const [receipt, setReceipt] = useState<PaymentReceipt | undefined>(initialReceipt);
  const [error, setError] = useState<string | undefined>(initialError);

  useEffect(() => {
    if (initialReceipt || initialError) return;
    let cancelled = false;
    fetch('/api/payments/complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paymentId: id }),
    })
      .then(async (res) => {
        const data = await res.json().catch(() => null);
        if (cancelled) return;
        if (res.ok && data?.payment) setReceipt(data.payment);
        else setError(data?.error ?? '결제 확인에 실패했어요.');
      })
      .catch(() => {
        if (!cancelled) setError('결제 확인에 실패했어요.');
      });
    return () => {
      cancelled = true;
    };
  }, [id, initialReceipt, initialError]);

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[1280px] flex-col">
      <main className="flex w-full flex-1 flex-col items-center gap-6 px-5 pt-16 pb-8">
        {error ? (
          <EmptyState
            visual="error"
            title="결제를 완료하지 못했어요"
            description={error}
            primaryAction={{ label: '홈으로 가기', onClick: () => router.push('/') }}
            className="flex-1"
          />
        ) : receipt === undefined ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4">
            <Spinner />
            <p className="type-body-md text-text-secondary">결제를 확인하고 있어요.</p>
          </div>
        ) : (
          <>
            <span
              aria-hidden
              className="mt-2 flex size-[72px] items-center justify-center rounded-full bg-background-brand text-text-on-brand"
            >
              <Icon name="check" size={32} />
            </span>

            <div className="flex w-full max-w-[420px] flex-col items-center gap-2 text-center">
              <h1 className="type-heading-lg text-text-default">한 자리, 확정됐어요</h1>
              <p className="type-body-md text-text-secondary">{receipt.eventName}에서 만나요.</p>
            </div>

            <section
              aria-label="결제 영수증"
              className="flex w-full max-w-[420px] flex-col gap-4 rounded-2xl border border-border-default bg-background-surface p-5"
            >
              <div className="flex items-center gap-3">
                <div className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-background-image-placeholder-warm">
                  {receipt.imageUrl && (
                    <Image src={receipt.imageUrl} alt="" fill sizes="64px" className="object-cover" />
                  )}
                </div>
                <div className="flex min-w-0 flex-col gap-1">
                  <span className="type-label-md font-semibold tracking-[0.07em] text-text-brand">
                    {EVENT_CAMPAIGN.eyebrowVol}
                  </span>
                  <span className="type-heading-sm truncate text-text-default">
                    {receipt.eventName}
                  </span>
                </div>
              </div>

              <dl className="flex flex-col gap-3 border-t border-border-default pt-4">
                {[
                  ['결제 금액', formatPrice(receipt.amount)],
                  ['결제 일시', formatPaymentDateTime(receipt.paidAt)],
                  ['참여 일정', formatPaymentDateTime(receipt.eventAt)],
                ].map(([label, value]) => (
                  <div key={label} className="flex items-center justify-between">
                    <dt className="type-label-md text-text-subtle">{label}</dt>
                    <dd className="type-label-md font-semibold text-text-default">{value}</dd>
                  </div>
                ))}
              </dl>
            </section>

            <div className="flex w-full max-w-[420px] flex-col gap-3">
              <Button size="lg" className="w-full" onClick={() => router.push('/my?tab=payments')}>
                결제 내역 보기
              </Button>
              <Button
                variant="secondary"
                size="lg"
                className="w-full"
                onClick={() => router.push('/')}
              >
                홈으로
              </Button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
