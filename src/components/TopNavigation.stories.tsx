import type { Meta, StoryObj } from '@storybook/nextjs-vite';

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
