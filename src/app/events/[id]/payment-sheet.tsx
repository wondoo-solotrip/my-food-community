'use client';

/**
 * 결제 바텀시트 — design.pen `16 Payment Sheet`. 규칙: rules/payment.md (SSOT).
 *
 * 참여 현황(진행 막대)·결제 금액·결제 진행 버튼·약관 문구. 결제 진행을 누르면
 * 로그인·중복 참여를 사전 점검한 뒤 포트원 V2 결제창(`PortOne.requestPayment`)을
 * 연다. 성공하면 결제 완료 페이지(`/payments/[paymentId]/complete`)로 이동해
 * 서버 검증(POST /api/payments/complete)을 받는다. 모바일 리디렉션 플로우도
 * 같은 완료 페이지로 돌아온다.
 */
import PortOne from '@portone/browser-sdk/v2';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { BottomSheet, Button } from '@/components';
import { formatPrice, type EventDetail } from '@/lib/events';

export interface PaymentSheetProps {
  event: EventDetail;
  onClose: () => void;
  /** Storybook 프리뷰 프레임 안에 앉힐 때 `absolute`. 앱에서는 생략(fixed). */
  position?: 'fixed' | 'absolute';
  /** Storybook에서 실패 문구를 주입한다. 앱에서는 생략. */
  initialError?: string;
}

export function PaymentSheet({ event, onClose, position, initialError }: PaymentSheetProps) {
  const router = useRouter();
  const [isPaying, setIsPaying] = useState(false);
  const [error, setError] = useState<string | undefined>(initialError);

  const handlePay = async () => {
    setIsPaying(true);
    setError(undefined);
    try {
      const storeId = process.env.NEXT_PUBLIC_PORTONE_STORE_ID;
      const channelKey = process.env.NEXT_PUBLIC_PORTONE_CHANNEL_KEY;
      if (!storeId || !channelKey) {
        setError('결제 설정이 없어요. 관리자에게 문의해주세요.');
        return;
      }

      // 결제창을 열기 전에 로그인·중복 참여를 BFF에서 먼저 걸러낸다 —
      // 승인된 뒤에 거절하면 환불이 필요해지기 때문이다.
      const [meResponse, participationResponse] = await Promise.all([
        fetch('/api/auth/me'),
        fetch(`/api/events/${event.id}/participation`),
      ]);
      if (meResponse.status === 401) {
        router.push('/login');
        return;
      }
      if (!meResponse.ok || !participationResponse.ok) {
        setError('결제 준비에 실패했어요. 잠시 후 다시 시도해주세요.');
        return;
      }
      const { user } = await meResponse.json();
      const { participated } = await participationResponse.json();
      if (participated) {
        setError('이미 참여 확정된 모임이에요.');
        return;
      }

      // paymentId(UUID v4)가 원장 transaction_key로 그대로 저장된다.
      const paymentId = crypto.randomUUID();
      const response = await PortOne.requestPayment({
        storeId,
        channelKey,
        paymentId,
        // 주문명·금액은 BFF(GET /api/events/[id])가 내려준 DB 값 그대로 쓴다.
        orderName: event.name,
        totalAmount: event.price,
        currency: 'KRW',
        payMethod: 'CARD',
        // 모바일 리디렉션 플로우 — 포트원이 결과 쿼리(paymentId·code·message)를
        // 붙여 이 URL로 돌아온다.
        redirectUrl: `${window.location.origin}/payments/${paymentId}/complete`,
        customData: { productId: event.id, userId: user.id },
      });

      if (!response) return; // 리디렉션 플로우 — 페이지가 이동 중이다.
      if (response.code !== undefined) {
        setError(response.message ?? '결제에 실패했어요. 다시 시도해주세요.');
        return;
      }
      // 승인 검증·원장 기록은 완료 페이지가 BFF로 진행한다.
      router.push(`/payments/${paymentId}/complete`);
    } finally {
      setIsPaying(false);
    }
  };

  const ratio = event.capacity > 0 ? Math.min(event.participantCount / event.capacity, 1) : 0;

  return (
    <BottomSheet
      align="start"
      title="한 자리, 곧 확정돼요"
      description={event.name}
      onClose={onClose}
      position={position}
    >
      <div className="flex flex-col gap-4 pt-1">
        <div className="flex flex-col gap-2 rounded-xl bg-background-brand-subtle p-4">
          <div className="flex items-center justify-between">
            <span className="type-label-lg text-text-default">참여 현황</span>
            <span className="type-label-lg text-text-brand">
              {event.participantCount} / {event.capacity}명
            </span>
          </div>
          <div
            role="progressbar"
            aria-label="참여 현황"
            aria-valuemin={0}
            aria-valuemax={event.capacity}
            aria-valuenow={event.participantCount}
            className="h-1.5 w-full overflow-hidden rounded-full bg-brand-100"
          >
            <div
              className="h-full rounded-full bg-background-brand-accent"
              style={{ width: `${ratio * 100}%` }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="type-body-md text-text-secondary">결제 금액</span>
          <span className="type-heading-md text-text-default">{formatPrice(event.price)}</span>
        </div>

        {error && (
          <p role="alert" className="type-label-md text-center text-text-error">
            {error}
          </p>
        )}

        <Button size="lg" loading={isPaying} onClick={handlePay} className="w-full">
          결제 진행
        </Button>

        <p className="type-label-md text-center text-text-subtle">
          결제 진행 시 취소·환불 정책에 동의한 것으로 간주합니다.
        </p>
      </div>
    </BottomSheet>
  );
}
