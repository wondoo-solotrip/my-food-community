import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';

import { BottomSheet } from './BottomSheet';
import { SelectItem, SelectList } from './Select';

const meta = {
  title: 'Components/Bottom Sheet',
  component: BottomSheet,
  tags: ['autodocs'],
  args: {
    title: '정렬 기준을 선택하세요',
    description: '원하는 항목을 선택하거나 스크림을 눌러 닫을 수 있습니다.',
    onClose: fn(),
    position: 'absolute',
  },
  argTypes: {
    position: { control: 'inline-radio', options: ['absolute', 'fixed'] },
  },
  decorators: [
    (Story) => (
      <div className="relative h-[360px] w-[360px] overflow-hidden border border-border-default bg-background-default">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof BottomSheet>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args) => (
    <BottomSheet {...args}>
      <SelectList label="정렬 기준">
        <SelectItem label="최신순" state="selected" />
        <SelectItem label="인기순" />
      </SelectList>
    </BottomSheet>
  ),
};

/**
 * This is where the guide routes a mobile select: the same `SelectItem`s that sit
 * under the trigger on desktop go into a bottom sheet instead.
 */
export const AsSelectPanel: Story = {
  render: (args) => (
    <BottomSheet {...args}>
      <SelectList label="지역">
        <SelectItem label="구로구" />
        <SelectItem label="영등포구" state="selected" />
        <SelectItem label="금천구" />
      </SelectList>
    </BottomSheet>
  ),
};

/** Title and description are optional; the handle and content area are not. */
export const ContentOnly: Story = {
  args: { title: undefined, description: undefined },
  render: (args) => (
    <BottomSheet {...args}>
      <p className="type-body-md text-text-secondary">임의의 콘텐츠가 들어갈 수 있습니다.</p>
    </BottomSheet>
  ),
};
