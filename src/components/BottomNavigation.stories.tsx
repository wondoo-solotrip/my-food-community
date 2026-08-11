import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { BottomNavigation } from './navigation';
import { Stack } from './docs/Matrix';

/** The four items the design file ships. */
const ITEMS = [
  { icon: 'home', label: '홈' },
  { icon: 'search', label: '검색' },
  { icon: 'bookmark', label: '저장' },
  { icon: 'user', label: '마이' },
];

const meta = {
  title: 'Components/Bottom Navigation',
  component: BottomNavigation,
  tags: ['autodocs'],
  args: { items: ITEMS, activeIndex: 0, showLabels: true },
  argTypes: {
    activeIndex: { control: { type: 'range', min: 0, max: 3, step: 1 } },
  },
  decorators: [
    (Story) => (
      <div className="w-[360px] border border-border-default">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof BottomNavigation>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/** Labels are optional; without them the name moves into `sr-only` text. */
export const WithoutLabels: Story = {
  args: { showLabels: false },
};

/**
 * The guide allows 2 to 5 items, distributed evenly. Note that selection is
 * conveyed by colour only — the icon set has no filled variants, so the "필" part
 * of the guide is not met by the design file. See the deviations table.
 */
export const ItemCounts: Story = {
  parameters: { controls: { disable: true } },
  decorators: [],
  render: () => (
    <Stack>
      {[2, 3, 4, 5].map((count) => (
        <div key={count} className="w-[360px]">
          <h3 className="mb-2 text-[11px] font-semibold tracking-wide text-text-subtle uppercase">
            {count}개
          </h3>
          <div className="border border-border-default">
            <BottomNavigation
              items={[...ITEMS, { icon: 'settings', label: '설정' }].slice(0, count)}
              activeIndex={0}
            />
          </div>
        </div>
      ))}
    </Stack>
  ),
};
