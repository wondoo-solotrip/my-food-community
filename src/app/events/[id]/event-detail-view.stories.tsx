import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect } from 'storybook/test';

import type { EventDetail } from '@/lib/events';

import { EventDetailView } from './event-detail-view';

/** `GET /api/events/[id]` 응답 모양 그대로 주입하는 데모 데이터. */
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
  title: 'Pages/15 Event Detail',
  component: EventDetailView,
  parameters: { layout: 'fullscreen' },
  args: { id: EVENT.id, initialEvent: EVENT },
} satisfies Meta<typeof EventDetailView>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Content: Story = {
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('heading', { name: '주말 취미 요리교실' }),
    ).toBeVisible();
    await expect(canvas.getByText('8.29 토 10:00')).toBeVisible();
    await expect(
      canvas.getByText('서울특별시 강동구 고덕로 강일동 요리센터 2층'),
    ).toBeVisible();
    await expect(canvas.getByText('7 / 20명')).toBeVisible();
    await expect(
      canvas.getByRole('button', { name: '30,000원 결제하기' }),
    ).toBeEnabled();
  },
};

/** 결제하기를 누르면 결제 바텀시트가 열린다. */
export const PaymentSheetOpen: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: '30,000원 결제하기' }));
    await expect(canvas.getByRole('dialog', { name: '한 자리, 곧 확정돼요' })).toBeVisible();
    await expect(canvas.getByRole('progressbar', { name: '참여 현황' })).toBeVisible();
    await expect(canvas.getByRole('button', { name: '결제 진행' })).toBeEnabled();
  },
};

/** 정원이 차면 결제 진입이 잠긴다. */
export const SoldOut: Story = {
  args: { initialEvent: { ...EVENT, participantCount: 20 } },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('button', { name: '남은 자리가 없어요' })).toBeDisabled();
  },
};
