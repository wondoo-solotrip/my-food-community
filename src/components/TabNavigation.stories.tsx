import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { TabNavigation } from './navigation';
import { Stack } from './docs/Matrix';

const meta = {
  title: 'Components/Tab Navigation',
  component: TabNavigation,
  tags: ['autodocs'],
  args: { tabs: ['소개', '메뉴', '리뷰'], activeIndex: 0 },
  argTypes: {
    activeIndex: { control: { type: 'range', min: 0, max: 2, step: 1 } },
  },
  decorators: [
    (Story) => (
      <div className="w-[360px] border border-border-default">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof TabNavigation>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/**
 * 48px tall, items distributed evenly, and a 2px indicator under the selected
 * tab. The unselected indicator is transparent rather than absent, so switching
 * tabs never nudges the labels.
 */
export const Selection: Story = {
  parameters: { controls: { disable: true } },
  decorators: [],
  render: () => (
    <Stack>
      {[0, 1, 2].map((index) => (
        <div key={index} className="w-[360px] border border-border-default">
          <TabNavigation tabs={['소개', '메뉴', '리뷰']} activeIndex={index} />
        </div>
      ))}
    </Stack>
  ),
};
