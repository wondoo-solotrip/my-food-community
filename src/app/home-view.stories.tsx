import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect } from 'storybook/test';

import { HIDDEN_PICKS } from '@/lib/restaurants';
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

const meta = {
  title: 'Pages/01 Main Page',
  component: HomeView,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof HomeView>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { initialPlaces: DEMO_PLACES } };

export const Content: Story = {
  args: { initialPlaces: DEMO_PLACES },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('heading', { name: '구로 맛집 지도' })).toBeVisible();
    await expect(canvas.getByRole('heading', { name: '오늘의 숨은 맛집' })).toBeVisible();
    // 디자인의 포스터 그리드 4장이 모두 상세로 연결된다.
    await expect(canvas.getAllByRole('link')).toHaveLength(4);
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
