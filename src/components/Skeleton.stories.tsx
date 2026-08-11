import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { Skeleton, type SkeletonVariant } from './Skeleton';
import { Matrix } from './docs/Matrix';

const VARIANTS: SkeletonVariant[] = ['text', 'rectangle', 'circle'];

const meta = {
  title: 'Components/Skeleton',
  component: Skeleton,
  tags: ['autodocs'],
  args: { variant: 'text', lines: 3, size: 64 },
  argTypes: {
    variant: { control: 'inline-radio', options: VARIANTS },
  },
} satisfies Meta<typeof Skeleton>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/**
 * Three types, no states. Sizing is meant to follow whatever element the skeleton
 * stands in for, so the values below are just the design file's own defaults.
 */
export const AllVariants: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Matrix
      rows={['skeleton']}
      hideRowLabels
      columns={VARIANTS}
      render={(_row, column) => <Skeleton variant={column as SkeletonVariant} />}
    />
  ),
};

/** Standing in for a card: image block, heading line, body lines and an avatar. */
export const InPlaceOfCard: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex w-[320px] flex-col gap-3 rounded-2xl border border-border-default bg-background-surface p-4">
      <Skeleton variant="rectangle" width="100%" height={150} />
      <Skeleton variant="text" lines={2} width="100%" />
      <div className="flex items-center gap-2">
        <Skeleton variant="circle" size={32} />
        <Skeleton variant="text" lines={1} width={120} />
      </div>
    </div>
  ),
};
