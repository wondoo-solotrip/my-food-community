import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { Badge } from './Badge';
import { Card } from './Card';
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
 * on the left, tightened content (`p-3 gap-1`), no description.
 */
export const Horizontal: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Card
      orientation="horizontal"
      image
      title="골목 끝 화덕 생선구이"
      metadata={{ icon: 'calendar', text: '2026. 07. 28' }}
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
