import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent } from 'storybook/test';

import type { PlaceSearchResult } from '@/lib/places';

import { PlaceSearchView } from './place-search-view';

/** design.pen 08 화면의 검색 결과 4건 그대로. */
const RESULTS: PlaceSearchResult[] = [
  { name: '서울특별시청', roadAddress: '서울특별시 중구 세종대로 110', jibunAddress: '중구 태평로1가 31' },
  { name: '서울도서관', roadAddress: '서울특별시 중구 세종대로 110', jibunAddress: '중구 태평로1가 31' },
  { name: '서울광장', roadAddress: '서울특별시 중구 을지로 12', jibunAddress: '중구 태평로1가 54-3' },
  { name: '덕수궁', roadAddress: '서울특별시 중구 세종대로 99', jibunAddress: '중구 정동 5-1' },
];

const meta = {
  title: 'Pages/08 장소 검색',
  component: PlaceSearchView,
  parameters: { layout: 'fullscreen' },
  args: {
    onBack: fn(),
    onSelect: fn(),
    onRegisterName: fn(),
  },
} satisfies Meta<typeof PlaceSearchView>;

export default meta;

type Story = StoryObj<typeof meta>;

/** 검색 전 대기 상태 — 안내 헬퍼만 보인다. */
export const Default: Story = {};

/** `.pen` 08 — 검색 결과 목록. 항목을 누르는 즉시 그 장소를 들고 지도(07)로 돌아간다. */
export const Results: Story = {
  args: { initialQuery: '서울시청', initialResults: RESULTS },
  play: async ({ canvas, args }) => {
    await expect(
      canvas.getByText('네이버 지역 검색 API에서 제공한 장소명과 주소입니다.'),
    ).toBeVisible();

    // 항목을 누르면 별도 확정 버튼 없이 바로 그 결과가 넘어간다.
    await userEvent.click(canvas.getByRole('button', { name: /서울도서관/ }));
    await expect(args.onSelect).toHaveBeenCalledWith(RESULTS[1]);
  },
};

/**
 * `.pen` 09 — 결과 없음. 직접 입력 필드가 검색어로 채워지고 장소명만 들고
 * 지도(07)로 돌아간다 — 지도 정보가 필수라 주소·좌표는 지도에서 확정한다.
 */
export const NoResults: Story = {
  args: { initialQuery: '우리동네 비밀식당', initialResults: [] },
  play: async ({ canvas, args }) => {
    await expect(canvas.getByText('검색 결과가 없어요')).toBeVisible();
    await expect(canvas.getByText('네이버에서 검색된 장소가 없습니다.')).toBeVisible();
    await expect(
      canvas.getByText('직접 입력한 장소는 지도에서 위치를 지정해 주소를 확인해야 등록할 수 있습니다.'),
    ).toBeVisible();
    await expect(canvas.getByLabelText('장소명 직접 입력')).toHaveValue('우리동네 비밀식당');

    await userEvent.click(canvas.getByRole('button', { name: '장소명으로 등록하기' }));
    await expect(args.onRegisterName).toHaveBeenCalledWith('우리동네 비밀식당');
  },
};
