import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect } from 'storybook/test';

import { RESTAURANTS } from '@/lib/restaurants';
import type { PlaceDetail } from '@/lib/places';

import { RestaurantDetailView } from './restaurant-detail-view';

/** 데모 데이터를 `GET /api/places/[id]` 응답 모양으로 맞춘다. */
const DEMO_PLACE: PlaceDetail = {
  id: RESTAURANTS[0].id,
  title: RESTAURANTS[0].name,
  content: RESTAURANTS[0].story,
  address: '등록 대기중',
  placeName: null,
  lat: null,
  lng: null,
  createdAt: '2026-07-28T12:00:00.000Z',
  imageUrls: Array.from({ length: RESTAURANTS[0].photoCount }, (_, i) =>
    i === 0 ? RESTAURANTS[0].heroImage : RESTAURANTS[0].image,
  ),
  isOwner: false,
};

const meta = {
  title: 'Pages/02 Detail Page',
  component: RestaurantDetailView,
  parameters: { layout: 'fullscreen' },
  args: { id: DEMO_PLACE.id, initialPlace: DEMO_PLACE },
} satisfies Meta<typeof RestaurantDetailView>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Content: Story = {
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('heading', { name: '골목 끝 화덕 생선구이' }),
    ).toBeVisible();
    await expect(canvas.getByRole('heading', { name: '왜 숨은 맛집인가요?' })).toBeVisible();
    await expect(canvas.getByText('1/5')).toBeVisible();
    // 장소를 고르지 않은 글에는 위치 섹션이 없다.
    await expect(canvas.queryByRole('heading', { name: '위치' })).not.toBeInTheDocument();
  },
};

/**
 * `.pen` 10 — 지도 정보가 저장된 글. 사진 아래에 DB 좌표를 중심으로 한 네이버
 * 미니 실지도(마커 라벨은 장소명)와 지번 주소 행이 붙는다.
 */
export const WithLocation: Story = {
  args: {
    initialPlace: {
      ...DEMO_PLACE,
      placeName: RESTAURANTS[0].name,
      address: '서울특별시 마포구 동교동 168-25',
      lat: 37.5563188,
      lng: 126.9226557,
    },
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('heading', { name: '위치' })).toBeVisible();
    await expect(canvas.getByText('NAVER 지도')).toBeVisible();
    await expect(canvas.getByText('서울특별시 마포구 동교동 168-25')).toBeVisible();
    // 히어로 제목에 더해 마커 라벨에도 DB에 저장된 장소명이 보인다.
    await expect(canvas.getAllByText(RESTAURANTS[0].name)).toHaveLength(2);
  },
};

/** 지도 연동 전(직접 입력)에 등록된 글 폴백 — 지도 없이 장소명 행만 보여준다. */
export const NameOnlyLocation: Story = {
  args: {
    initialPlace: { ...DEMO_PLACE, placeName: '우리동네 비밀식당' },
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('heading', { name: '위치' })).toBeVisible();
    await expect(canvas.getByText('우리동네 비밀식당')).toBeVisible();
  },
};
