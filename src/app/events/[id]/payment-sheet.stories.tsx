import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn } from 'storybook/test';

import type { EventDetail } from '@/lib/events';

import { PaymentSheet } from './payment-sheet';

/** 모임 상세와 같은 `EventDetail` 모양을 주입한다. */
const EVENT: EventDetail = {
  id: '16f61b58-794f-40c2-b241-891dff3aab67',
  name: '주말 취미 요리교실',
  description: '주말에 함께 요리 배워요~',
  eventAt: '2026-08-29T10:00:00+09:00',
  address: '서울특별시 강동구 고덕로 강일동 요리센터 2층',
  capacity: 20,
  price: 30000,
  participantCount: 7,
  bannerImage: {
    lg: '/images/wine-table.png',
    md: '/images/guro-table-dinner.png',
  },
  detailImage: {
    lg: '/images/wine-table.png',
    md: '/images/guro-table-dinner.png',
  },
};

const meta = {
  title: 'Pages/16 Payment Sheet',
  component: PaymentSheet,
  args: { event: EVENT, onClose: fn(), position: 'absolute' },
  decorators: [
    (Story) => (
      <div className="relative h-[480px] w-[360px] overflow-hidden border border-border-default bg-background-default">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof PaymentSheet>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Content: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('dialog', { name: '한 자리, 곧 확정돼요' })).toBeVisible();
    await expect(canvas.getByText('주말 취미 요리교실')).toBeVisible();
    await expect(canvas.getByText('7 / 20명')).toBeVisible();
    await expect(canvas.getByText('30,000원')).toBeVisible();
    await expect(canvas.getByRole('button', { name: '결제 진행' })).toBeEnabled();
    await expect(
      canvas.getByText('결제 진행 시 취소·환불 정책에 동의한 것으로 간주합니다.'),
    ).toBeVisible();
  },
};

/** 결제 실패·사전 점검 거절 시 버튼 위에 오류 문구가 뜬다. */
export const PaymentFailed: Story = {
  args: { initialError: '이미 참여 확정된 모임이에요.' },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('alert')).toHaveTextContent('이미 참여 확정된 모임이에요.');
    await expect(canvas.getByRole('button', { name: '결제 진행' })).toBeEnabled();
  },
};

/** 스크림을 누르면 선택 없이 닫힌다. */
export const CloseOnScrim: Story = {
  play: async ({ canvas, userEvent, args }) => {
    const dialog = canvas.getByRole('dialog', { name: '한 자리, 곧 확정돼요' });
    await userEvent.click(dialog.parentElement!);
    await expect(args.onClose).toHaveBeenCalled();
  },
};
