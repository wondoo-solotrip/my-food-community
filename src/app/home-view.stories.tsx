import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect } from 'storybook/test';

import { HIDDEN_PICKS } from '@/lib/restaurants';
import type { EventSummary } from '@/lib/events';
import type { PlaceSummary } from '@/lib/places';

import { HomeView } from './home-view';

/** 데모 데이터를 `GET /api/places` 응답 모양으로 맞춘다. */
const DEMO_PLACES: PlaceSummary[] = HIDDEN_PICKS.map((restaurant) => ({
  id: restaurant.id,
  title: restaurant.name,
  content: restaurant.story,
  address: '등록 대기중',
  createdAt: '2026-07-28T12:00:00.000Z',
  imageUrl: restaurant.image,
  imageCount: restaurant.photoCount,
}));

/** `GET /api/events` 응답 모양의 배너 모임 — 완성형 크리에이티브 이미지. */
const DEMO_EVENT: EventSummary = {
  id: '16f61b58-794f-40c2-b241-891dff3aab67',
  name: '주말 취미 요리교실',
  eventAt: '2026-08-29T10:00:00+09:00',
  capacity: 20,
  price: 30000,
  bannerImage: {
    lg: '/images/wine-table.png',
    md: '/images/guro-table-dinner.png',
  },
};

const meta = {
  title: 'Pages/01 Main Page',
  component: HomeView,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof HomeView>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { initialPlaces: DEMO_PLACES, initialEvent: DEMO_EVENT },
};

export const Content: Story = {
  args: { initialPlaces: DEMO_PLACES, initialEvent: DEMO_EVENT },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('heading', { name: '맛집커뮤니티' })).toBeVisible();
    await expect(canvas.getByRole('heading', { name: '이 맛집 어때요?' })).toBeVisible();
    await expect(canvas.getByText('대부도 숨은 맛집')).toBeVisible();
    // 배너 링크 1개 + 디자인의 포스터 그리드 4장이 모두 상세로 연결된다.
    await expect(canvas.getAllByRole('link')).toHaveLength(5);
    // 배너 카피는 크리에이티브에 새겨져 있어 이미지 alt로 확인한다.
    await expect(canvas.getByRole('img', { name: DEMO_EVENT.name })).toBeVisible();
  },
};

export const Empty: Story = {
  args: { initialPlaces: [] },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('heading', { name: '아직 등록된 맛집이 없어요' }),
    ).toBeVisible();
  },
};
