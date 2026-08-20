import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { Badge } from './Badge';
import { Card } from './Card';
import { IconButton } from './IconButton';
import { Matrix } from './docs/Matrix';

const meta = {
  title: 'Components/Card',
  component: Card,
  tags: ['autodocs'],
  args: {
    title: '골목 끝 화덕 생선구이',
    description: '시장 뒤편 작은 문 안쪽에서 만나는 따뜻한 한 끼',
    metadata: { icon: 'home', text: '구로시장 · 도보 3분' },
    image: true,
  },
  decorators: [
    (Story) => (
      <div className="w-[320px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Card>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/**
 * Single variant, auto height. The image area is the only optional part; when it
 * is present but has no photo yet it shows `color-background-image-placeholder-warm`,
 * the token the colour foundation reserves for food imagery.
 */
export const WithAndWithoutImage: Story = {
  parameters: { controls: { disable: true } },
  decorators: [],
  render: () => (
    <Matrix
      rows={['card']}
      hideRowLabels
      columns={['이미지 있음', '이미지 없음']}
      render={(_row, column) => (
        <div className="w-[320px]">
          <Card
            image={column === '이미지 있음' ? true : undefined}
            title="골목 끝 화덕 생선구이"
            description="시장 뒤편 작은 문 안쪽에서 만나는 따뜻한 한 끼"
            metadata={{ icon: 'home', text: '구로시장 · 도보 3분' }}
          />
        </div>
      )}
    />
  ),
};

/**
 * `.pen` my-page instances lay the card out horizontally: a 96px square photo
 * on the left, tightened content, no description. 마이페이지는 사진 우측에도
 * 라운드를 주고(`rounded-r-2xl`), 글자 블록의 위 패딩을 없애 제목을 사진 상단
 * 라인에 맞추며, 날짜는 아이콘 없이 텍스트만 쓴다.
 */
export const Horizontal: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Card
      orientation="horizontal"
      bordered={false}
      image
      className="gap-3"
      imageClassName="size-24 overflow-hidden rounded-r-2xl"
      contentClassName="gap-1 p-0"
      metadataPosition="top"
      title="골목 끝 화덕 생선구이"
      description="경기도 안산시 단원구 대부남동 산 129-3"
      metadata={{ text: '2026. 07. 28' }}
      metadataTrailing={
        <IconButton
          icon="more-vertical"
          label="더보기"
          size={32}
          iconSize={16}
          className="-my-2 -mr-2 text-text-subtle"
        />
      }
    />
  ),
};

/**
 * `imageClassName` swaps the fixed 150px image height for a fluid box — the
 * main-page poster grid uses the `.pen` cards' 156:132 ratio so photos scale
 * with the column width.
 */
export const FluidImageArea: Story = {
  parameters: { controls: { disable: true } },
  decorators: [],
  render: () => (
    <div className="grid w-[480px] grid-cols-2 gap-4">
      <Card
        image
        imageClassName="aspect-[13/11] w-full"
        title="골목 끝 화덕..."
        metadata={{ icon: 'home', text: '주차장 뒤편 작은 문' }}
      />
      <Card
        image
        imageClassName="aspect-[13/11] w-full"
        title="시장 안쪽 손칼국수"
        metadata={{ icon: 'home', text: '구로시장' }}
      />
    </div>
  ),
};

/**
 * `titleClassName` swaps the default 16px heading for another type style —
 * the main-page poster grid uses `type-label-lg` (14px semibold).
 */
export const CompactTitle: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Card
      image
      imageClassName="aspect-[13/11] w-full"
      titleClassName="type-label-lg"
      title="골목 끝 화덕 생선구이"
      metadata={{ icon: 'home', text: '구로시장 · 도보 3분' }}
    />
  ),
};

/**
 * 흰 배경 페이지에 얹는 플랫 포스터 스타일 — 테두리 없음(`bordered={false}`),
 * 텍스트는 좌우 패딩 없이 사진 가장자리에 정렬(`contentClassName`), 주소는
 * 아이콘 없이 텍스트만(`metadata.icon` 생략). 메인 페이지 그리드가 쓴다.
 */
export const FlatPoster: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Card
      bordered={false}
      image
      imageClassName="h-[154px] w-full overflow-hidden rounded-2xl"
      titleClassName="type-label-lg"
      contentClassName="gap-0 px-0 py-2"
      title="골목 끝 화덕 생선구이"
      metadata={{ text: '경기도 안산시' }}
    />
  ),
};

/** Composition check — a badge dropped into the image slot's overlay. */
export const WithBadge: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Card
      image={
        <div className="flex size-full items-end justify-start p-3">
          <Badge label="신규" type="neutral" />
        </div>
      }
      title="골목 끝 화덕 생선구이"
      description="시장 뒤편 작은 문 안쪽에서 만나는 따뜻한 한 끼"
      metadata={{ icon: 'home', text: '구로시장 · 도보 3분' }}
    />
  ),
};
