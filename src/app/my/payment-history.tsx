'use client';

/**
 * 마이페이지 결제 내역·취소 내역 카드 — design.pen `13 My Page / Payments Tab`·
 * `14 My Page / Canceled Tab`.
 *
 * 프레젠테이션 전용 컴포넌트: 데이터와 취소 동작은 my-view가 넘긴다.
 */
import Image from 'next/image';

import { Badge, Button } from '@/components';
import {
  formatEventSchedule,
  formatPaymentDateTime,
  formatPrice,
  type CanceledHistoryItem,
  type PaymentHistoryItem,
} from '@/lib/events';

export interface PaymentHistoryCardProps {
  payment: PaymentHistoryItem;
  /** 취소 요청이 진행 중이면 버튼이 잠긴다. */
  canceling?: boolean;
  onCancel?: (payment: PaymentHistoryItem) => void;
}

/** 참여 확정 결제 카드 — 요약·결제 정보·결제 취소 버튼. 흰 배경 위 플랫
    스타일: 테두리·패딩 없이 가로 폭을 넉넉하게 쓴다. */
export function PaymentHistoryCard({ payment, canceling, onCancel }: PaymentHistoryCardProps) {
  return (
    <article className="flex flex-col gap-4">
      <div className="flex gap-3">
        <div className="relative size-[72px] shrink-0 overflow-hidden rounded-xl bg-background-image-placeholder-warm">
          {payment.imageUrl && (
            <Image src={payment.imageUrl} alt="" fill sizes="72px" className="object-cover" />
          )}
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          {/* DS `Badge / SUCCESS / MD` — 외곽선 결제 취소 버튼과 겹쳐 보이지
              않도록 필컬러(filled) 변형을 쓴다. */}
          <Badge type="success" label="참여 확정" filled className="self-start" />
          <h3 className="type-heading-sm truncate text-text-default">{payment.eventName}</h3>
          <p className="type-label-md truncate text-text-secondary">
            {formatEventSchedule(payment.eventAt, payment.eventAddress)}
          </p>
        </div>
      </div>

      <dl className="flex flex-col gap-2 border-t border-border-default pt-3">
        {[
          ['결제 금액', formatPrice(payment.amount)],
          ['결제 일시', formatPaymentDateTime(payment.paidAt)],
        ].map(([label, value]) => (
          <div key={label} className="flex items-center justify-between">
            <dt className="type-label-md text-text-subtle">{label}</dt>
            <dd className="type-label-md font-semibold text-text-default">{value}</dd>
          </div>
        ))}
      </dl>

      {onCancel && (
        <Button
          variant="destructive"
          size="sm"
          className="w-full"
          disabled={canceling}
          onClick={() => onCancel(payment)}
        >
          결제 취소
        </Button>
      )}
    </article>
  );
}

export interface CanceledHistoryCardProps {
  canceled: CanceledHistoryItem;
}

/** 환불 완료 카드 — subtle 배경, 환불 금액·취소 일시·환불 안내. */
export function CanceledHistoryCard({ canceled }: CanceledHistoryCardProps) {
  return (
    <article className="flex flex-col gap-3 rounded-2xl bg-background-subtle p-4">
      <div className="flex items-center justify-between gap-2">
        <h3 className="type-heading-sm truncate font-bold text-text-default">
          {canceled.eventName}
        </h3>
        {/* 참여 확정(teal)과 구분되도록 종결 상태는 뉴트럴 필 배지로 쓴다. */}
        <Badge type="neutral" filled label="환불 완료" className="shrink-0" />
      </div>

      <dl className="flex flex-col gap-2">
        {[
          ['환불 금액', formatPrice(canceled.amount)],
          ['취소 일시', formatPaymentDateTime(canceled.canceledAt)],
        ].map(([label, value]) => (
          <div key={label} className="flex items-center justify-between">
            <dt className="type-label-md text-text-subtle">{label}</dt>
            <dd className="type-label-md font-semibold text-text-default">{value}</dd>
          </div>
        ))}
      </dl>

      <p className="type-label-md text-text-secondary">
        카드사 사정에 따라 환불 반영까지 3–5일 걸릴 수 있어요.
      </p>
    </article>
  );
}
