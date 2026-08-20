import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn } from 'storybook/test';

import type { CanceledHistoryItem, PaymentHistoryItem } from '@/lib/events';

import { CanceledHistoryCard, PaymentHistoryCard } from './payment-history';

/** `GET /api/my/payments` 응답의 `payments[]` 항목 모양. */
const PAYMENT: PaymentHistoryItem = {
  id: '2f6f9b70-93a1-4a54-9b9e-1f30a4d20001',
  amount: 30000,
  paidAt: '2026-08-13T21:04:00+09:00',
  eventName: '8월 구로 미식 모임',
  eventAt: '2026-08-29T19:30:00+09:00',
  eventAddress: '구로시장 키친',
  imageUrl: '/images/guro-table-dinner.png',
};

/** `GET /api/my/payments` 응답의 `canceled[]` 항목 모양. */
const CANCELED: CanceledHistoryItem = {
  id: '2f6f9b70-93a1-4a54-9b9e-1f30a4d20002',
  amount: 25000,
  canceledAt: '2026-07-18T10:32:00+09:00',
  eventName: '7월 동네 식탁 이야기',
};

const meta = {
  title: 'Pages/13-14 My Page History',
  component: PaymentHistoryCard,
  parameters: { layout: 'padded' },
  args: { payment: PAYMENT, onCancel: fn() },
} satisfies Meta<typeof PaymentHistoryCard>;

export default meta;

type Story = StoryObj<typeof meta>;

/** 결제 내역 탭의 참여 확정 카드. */
export const Payment: Story = {
  play: async ({ canvas, userEvent, args }) => {
    await expect(canvas.getByText('참여 확정')).toBeVisible();
    await expect(canvas.getByText('8월 구로 미식 모임')).toBeVisible();
    // 2026-08-29는 토요일 — 요일은 데이터 기준으로 그린다.
    await expect(canvas.getByText('8.29 토 · 19:30 · 구로시장 키친')).toBeVisible();
    await expect(canvas.getByText('30,000원')).toBeVisible();
    await expect(canvas.getByText('2026.08.13 21:04')).toBeVisible();
    await userEvent.click(canvas.getByRole('button', { name: '결제 취소' }));
    await expect(args.onCancel).toHaveBeenCalledWith(PAYMENT);
  },
};

/** 취소 요청 중에는 버튼이 잠긴다. */
export const PaymentCanceling: Story = {
  args: { canceling: true },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('button', { name: '결제 취소' })).toBeDisabled();
  },
};

/** 취소 내역 탭의 환불 완료 카드. */
export const Canceled: Story = {
  render: () => <CanceledHistoryCard canceled={CANCELED} />,
  play: async ({ canvas }) => {
    await expect(canvas.getByText('환불 완료')).toBeVisible();
    await expect(canvas.getByText('7월 동네 식탁 이야기')).toBeVisible();
    await expect(canvas.getByText('25,000원')).toBeVisible();
    await expect(canvas.getByText('2026.07.18 10:32')).toBeVisible();
    await expect(
      canvas.getByText('카드사 사정에 따라 환불 반영까지 3–5일 걸릴 수 있어요.'),
    ).toBeVisible();
  },
};
