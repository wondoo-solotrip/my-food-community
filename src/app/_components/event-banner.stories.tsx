import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect } from 'storybook/test';

import type { EventSummary } from '@/lib/events';

import { EventBanner } from './event-banner';

/** `GET /api/events` 응답 모양 그대로 주입하는 데모 데이터. */
const EVENT: EventSummary = {
  id: '16f61b58-794f-40c2-b241-891dff3aab67',
  name: '주말 취미 요리교실',
  eventAt: '2026-08-29T10:00:00+09:00',
  capacity: 20,
  price: 30000,
  // 실제 배너는 카피·CTA가 새겨진 크리에이티브(lg 8:3 / md 2:1) 두 벌이다.
  // 스토리는 로컬 데모 사진으로 대체한다.
  bannerImage: {
    lg: '/images/wine-table.png',
    md: '/images/guro-table-dinner.png',
  },
};

const meta = {
  title: 'Pages/11 Main Page/Event Banner',
  component: EventBanner,
  parameters: { layout: 'padded' },
  args: { event: EVENT },
} satisfies Meta<typeof EventBanner>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Content: Story = {
  play: async ({ canvas }) => {
    const link = canvas.getByRole('link');
    await expect(link).toHaveAttribute('href', `/events/${EVENT.id}`);
    // 카피는 크리에이티브에 새겨져 있어 UI 텍스트가 없다 — 이미지 alt가
    // 배너의 이름 역할을 한다.
    await expect(canvas.getByRole('img', { name: EVENT.name })).toBeVisible();
  },
};
