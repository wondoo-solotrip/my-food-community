import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, userEvent } from 'storybook/test';

import { RESTAURANTS } from '@/lib/restaurants';
import type { PlaceDetail } from '@/lib/places';

import { RestaurantEditView } from './restaurant-edit-view';

/** 본인 글을 수정하는 상황 — isOwner가 true인 상세 응답을 주입한다. */
const DEMO_PLACE: PlaceDetail = {
  id: RESTAURANTS[0].id,
  title: RESTAURANTS[0].name,
  content: RESTAURANTS[0].story,
  address: '중구 태평로1가 31',
  placeName: '서울시청',
  lat: 37.5666102,
  lng: 126.9783881,
  createdAt: '2026-07-28T12:00:00.000Z',
  imageUrls: [RESTAURANTS[0].heroImage],
  isOwner: true,
};

const meta = {
  title: 'Pages/06 Edit Page',
  component: RestaurantEditView,
  parameters: { layout: 'fullscreen' },
  args: { id: DEMO_PLACE.id, initialPlace: DEMO_PLACE },
} satisfies Meta<typeof RestaurantEditView>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Content: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByLabelText('맛집 이름')).toHaveValue('골목 끝 화덕 생선구이');
    await expect(canvas.getByRole('button', { name: '수정하기' })).toBeEnabled();
    // 새 사진을 고르지 않으면 기존 사진이 유지된다는 안내가 보인다.
    await expect(canvas.getByText(/기존 사진 1장 유지/)).toBeVisible();
    // 저장된 지도 정보(지번 주소)가 장소 섹션에 채워져 있다.
    await expect(canvas.getByText('중구 태평로1가 31')).toBeVisible();
  },
};

/**
 * 지도 연동 전에 등록된 글 — 주소·좌표가 없어 확정된 장소로 인정하지 않는다.
 * 지도 정보는 필수라, 지도에서 장소를 다시 확정하기 전에는 수정이 막힌다.
 */
export const LegacyWithoutMap: Story = {
  args: {
    initialPlace: { ...DEMO_PLACE, address: '등록 대기중', placeName: null, lat: null, lng: null },
  },
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: '수정하기' }));
    await expect(canvas.getByText('지도에서 장소를 입력해주세요.')).toBeVisible();
  },
};

export const NotOwner: Story = {
  args: { initialPlace: { ...DEMO_PLACE, isOwner: false } },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('heading', { name: '수정 권한이 없어요' })).toBeVisible();
  },
};
