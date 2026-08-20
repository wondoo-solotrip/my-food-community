import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect } from 'storybook/test';

import type { PaymentReceipt } from '@/lib/events';

import { PaymentCompleteView } from './payment-complete-view';

/** `POST /api/payments/complete` 응답의 영수증 모양 그대로 주입하는 데모 데이터. */
const RECEIPT: PaymentReceipt = {
  id: '2f6f9b70-93a1-4a54-9b9e-1f30a4d20001',
  amount: 30000,
  paidAt: '2026-08-13T21:04:00+09:00',
  eventName: '8월 구로 미식 모임',
  eventAt: '2026-08-29T19:30:00+09:00',
  eventAddress: '구로시장 키친',
  imageUrl: '/images/guro-table-dinner.png',
};

const meta = {
  title: 'Pages/17 Payment Complete',
  component: PaymentCompleteView,
  parameters: { layout: 'fullscreen' },
  args: { id: RECEIPT.id, initialReceipt: RECEIPT },
} satisfies Meta<typeof PaymentCompleteView>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Content: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('heading', { name: '한 자리, 확정됐어요' })).toBeVisible();
    await expect(canvas.getByText('8월 구로 미식 모임에서 만나요.')).toBeVisible();
    await expect(canvas.getByText('30,000원')).toBeVisible();
    await expect(canvas.getByText('2026.08.13 21:04')).toBeVisible();
    await expect(canvas.getByText('2026.08.29 19:30')).toBeVisible();
    await expect(canvas.getByRole('button', { name: '결제 내역 보기' })).toBeEnabled();
    await expect(canvas.getByRole('button', { name: '홈으로' })).toBeEnabled();
  },
};

/** 리디렉션 실패(code 쿼리) 또는 서버 검증 거절 상태. */
export const Failed: Story = {
  args: { initialReceipt: undefined, initialError: '결제가 취소되었습니다.' },
  play: async ({ canvas }) => {
    await expect(canvas.getByText('결제를 완료하지 못했어요')).toBeVisible();
    await expect(canvas.getByText('결제가 취소되었습니다.')).toBeVisible();
    await expect(canvas.getByRole('button', { name: '홈으로 가기' })).toBeEnabled();
  },
};
