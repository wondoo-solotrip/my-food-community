import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { Icon } from './Icon';
import { TopNavigation } from './navigation';
import { Stack } from './docs/Matrix';

const meta = {
  title: 'Components/Top Navigation',
  component: TopNavigation,
  tags: ['autodocs'],
  args: {
    title: '맛집 상세',
    leading: { icon: 'arrow-left', label: '뒤로' },
    trailing: { icon: 'search', label: '검색' },
  },
  decorators: [
    (Story) => (
      <div className="w-[360px] border border-border-default">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof TopNavigation>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/**
 * Single variant, 56px tall, full width. Both side slots are optional — an empty
 * slot leaves a 40px spacer so the title stays centred rather than sliding over.
 */
export const Slots: Story = {
  parameters: { controls: { disable: true } },
  decorators: [],
  render: () => (
    <Stack>
      {[
        { caption: '좌 + 우', leading: true, trailing: true },
        { caption: '좌측만', leading: true, trailing: false },
        { caption: '우측만', leading: false, trailing: true },
        { caption: '없음', leading: false, trailing: false },
      ].map(({ caption, leading, trailing }) => (
        <div key={caption} className="w-[360px]">
          <h3 className="mb-2 text-[11px] font-semibold tracking-wide text-text-subtle uppercase">
            {caption}
          </h3>
          <div className="border border-border-default">
            <TopNavigation
              title="맛집 상세"
              leading={leading ? { icon: 'arrow-left', label: '뒤로' } : undefined}
              trailing={trailing ? { icon: 'search', label: '검색' } : undefined}
            />
          </div>
        </div>
      ))}
    </Stack>
  ),
};

/**
 * `trailingContent` — 아이콘 버튼 대신 커스텀 노드를 트레일링 슬롯에 그대로
 * 놓는다. 웹 마이페이지가 바텀 내비의 홈 항목(20px 아이콘 + 12px 라벨)을
 * 이 슬롯으로 옮겨 쓰는 형태.
 */
export const CustomTrailing: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <TopNavigation
      title="마이페이지"
      trailingContent={
        <button
          type="button"
          className="flex flex-col items-center justify-center gap-0.5 text-text-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus"
        >
          <Icon name="home" size={20} />
          <span className="type-label-md">홈</span>
        </button>
      }
    />
  ),
};
