import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent } from 'storybook/test';

import type { PlaceSearchResult } from '@/lib/places';

import { PlaceConfirmView } from './place-confirm-view';

const meta = {
  title: 'Pages/07 장소 등록',
  component: PlaceConfirmView,
  parameters: { layout: 'fullscreen' },
  args: {
    onSearch: fn(),
    onBack: fn(),
    onConfirm: fn(),
  },
} satisfies Meta<typeof PlaceConfirmView>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * 선택 전 — 장소 입력의 첫 화면. 핀·주소 없이 지도만 보이고 등록 버튼은
 * 비활성이다. 검색 필드를 누르면 장소 검색(08)으로 전환된다.
 * (디자인 파일에는 선택 완료 상태만 있어 이 상태는 그 규칙을 따라 보완한 것.)
 */
export const Empty: Story = {
  play: async ({ canvas, args }) => {
    await expect(canvas.getByRole('button', { name: '이 위치로 등록하기' })).toBeDisabled();
    await userEvent.click(canvas.getByRole('button', { name: '장소 검색' }));
    await expect(args.onSearch).toHaveBeenCalled();
  },
};

/** `.pen` 07 — 검색에서 장소를 고른 뒤. 핀 라벨·지번 주소 행·활성 등록 버튼. */
export const Selected: Story = {
  args: {
    place: {
      name: '서울시청',
      roadAddress: '서울특별시 중구 세종대로 110',
      jibunAddress: '중구 태평로1가 31',
      lat: 37.5666102,
      lng: 126.9783881,
    },
  },
  play: async ({ canvas, args }) => {
    // 장소명은 지도 위 검색 필드와 핀 라벨 두 곳에, 주소 행에는 지번 주소가 보인다.
    // (브랜딩은 실지도에서는 SDK가, 목업 폴백에서는 배지가 그리므로 단언하지 않는다.)
    await expect(canvas.getAllByText('서울시청')).toHaveLength(2);
    await expect(canvas.getByText('중구 태평로1가 31')).toBeVisible();

    // 확정은 장소명·지번 주소·좌표를 모두 채워 넘긴다(지도 정보 필수).
    // (실지도에서는 리버스 지오코딩이 반영된 중심 주소·좌표, 목업 폴백에서는
    // 검색 결과 그대로.)
    await userEvent.click(canvas.getByRole('button', { name: '이 위치로 등록하기' }));
    await expect(args.onConfirm).toHaveBeenCalledOnce();
    const [confirmed] = (args.onConfirm as unknown as {
      mock: { calls: [PlaceSearchResult][] };
    }).mock.calls[0];
    await expect(confirmed.name).toBe('서울시청');
    await expect(confirmed.jibunAddress).not.toBe('');
    await expect(typeof confirmed.lat).toBe('number');
    await expect(typeof confirmed.lng).toBe('number');

    // 지도 위 검색 필드는 재검색 진입점이다.
    await userEvent.click(canvas.getByRole('button', { name: /장소 다시 검색/ }));
    await expect(args.onSearch).toHaveBeenCalled();
  },
};

/**
 * 검색 결과 없이 장소명만 직접 입력한 뒤 — 검색 필드·핀 라벨에 장소명만 있다.
 * 지도 정보(주소·좌표)가 필수라, 실지도에서 지도 중심의 주소·좌표가 채워지기
 * 전까지 등록 버튼은 비활성이다. 실지도에서는 리버스 지오코딩이 기본 중심
 * (서울시청)의 주소를 채우면 활성화되고, 목업 폴백(주소 조회 없음)에서는
 * 비활성으로 남아 안내 문구가 보인다.
 */
export const DirectName: Story = {
  args: {
    place: { name: '우리동네 비밀식당', roadAddress: '', jibunAddress: '' },
  },
  play: async ({ canvas }) => {
    await expect(canvas.getAllByText('우리동네 비밀식당')).toHaveLength(2);

    // 주소·좌표가 없으면(목업 폴백) 확정할 수 없고 안내가 보인다.
    await expect(canvas.getByRole('button', { name: '이 위치로 등록하기' })).toBeDisabled();
    await expect(
      canvas.getByText(/지도에서 주소와 위치가 확인돼야 등록할 수 있어요/),
    ).toBeVisible();
  },
};
