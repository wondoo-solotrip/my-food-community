import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { NaverMap, NaverMapBadge } from './NaverMap';
import { Matrix } from './docs/Matrix';

const meta = {
  title: 'Components/Naver Map',
  component: NaverMap,
  tags: ['autodocs'],
  args: {
    variant: 'full',
    center: { lat: 37.5666102, lng: 126.9783881 },
    pin: true,
  },
  argTypes: {
    variant: { control: 'inline-radio', options: ['full', 'mini'] },
  },
  decorators: [
    (Story) => (
      <div className="w-[360px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof NaverMap>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/**
 * `.pen` 07 장소 등록의 전면 지도 — 네이버 지도 JavaScript API로 실제 지도를
 * 그린다. 기본 중심은 서울시청(`center` 생략 시), 파란 기본 마커가 지도
 * 정중앙에 고정되고 그 아래 지도만 드래그로 움직인다.
 * `NEXT_PUBLIC_NCP_MAP_CLIENT_ID`가 없거나 로드·인증에 실패하면 정적 목업
 * (장식 컨트롤 + 브랜딩 배지)으로 폴백한다.
 */
export const Full: Story = {
  parameters: { controls: { disable: true } },
  args: { variant: 'full', pin: true },
};

/**
 * `.pen` 10 맛집 상세의 미니 지도 — 12px 라운드 카드. `center`(DB에 저장된
 * 좌표)가 있으면 실지도를 보기 전용(드래그·줌 잠금)으로 그리고 그 좌표에
 * 파란 기본 마커를 올린다. 컨트롤과 브랜딩은 카드 밖(위치 헤더)에서
 * 보여준다. 로드·인증 실패 시 정적 목업으로 폴백한다.
 */
export const Mini: Story = {
  parameters: { controls: { disable: true } },
  args: {
    variant: 'mini',
    center: { lat: 37.5666102, lng: 126.9783881 },
    pin: true,
  },
};

/**
 * 지도 연동 전 글 폴백 — 좌표(`center`) 없이 주소만 저장된 글은 실지도 대신
 * 정적 목업에 핀만 올린다.
 */
export const MiniPlaceholder: Story = {
  parameters: { controls: { disable: true } },
  args: {
    variant: 'mini',
    center: undefined,
    pin: true,
  },
};

/** 브랜딩 배지 두 톤 — 지도 위(`map`)와 상세 위치 헤더(`subtle`). */
export const Badge: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Matrix
      rows={['badge']}
      hideRowLabels
      columns={['map', 'subtle']}
      render={(_row, column) => <NaverMapBadge tone={column as 'map' | 'subtle'} />}
    />
  ),
};
