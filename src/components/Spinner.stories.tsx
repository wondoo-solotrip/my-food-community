import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { Spinner } from './Spinner';
import { Matrix } from './docs/Matrix';

const meta = {
  title: 'Components/Spinner',
  component: Spinner,
  tags: ['autodocs'],
  args: { size: 24, tone: 'brand' },
  argTypes: {
    size: { control: 'inline-radio', options: [16, 20, 24] },
    tone: { control: 'inline-radio', options: ['brand', 'inherit'] },
  },
} satisfies Meta<typeof Spinner>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/**
 * `md (24)` in brand is the only combination the design system documents. The
 * smaller sizes and the `inherit` tone exist so a button can host one — a primary
 * button needs the spinner in `color-text-on-brand`, not brand.
 */
export const SizesAndTone: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Matrix
      rows={['brand', 'inherit']}
      columns={['16', '20', '24']}
      render={(row, column) => (
        <span className={row === 'inherit' ? 'text-text-error' : undefined}>
          <Spinner size={Number(column) as 16 | 20 | 24} tone={row as 'brand' | 'inherit'} />
        </span>
      )}
    />
  ),
};
