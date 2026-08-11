import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { IconButton, type IconButtonVariant } from './IconButton';
import { ICON_NAMES } from './Icon';
import { Matrix } from './docs/Matrix';

const VARIANTS: IconButtonVariant[] = ['ghost', 'brand', 'neutral'];

const meta = {
  title: 'Components/Icon Button',
  component: IconButton,
  tags: ['autodocs'],
  args: { icon: 'heart', label: '좋아요', variant: 'ghost', size: 48 },
  argTypes: {
    icon: { control: 'select', options: ICON_NAMES },
    variant: { control: 'inline-radio', options: VARIANTS },
    size: { control: 'inline-radio', options: [32, 40, 48] },
  },
} satisfies Meta<typeof IconButton>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/**
 * The three `.pen` components. `.pen` names them by background — Ghost has none,
 * Brand Circle fills with `color-background-brand`, Neutral Circle with
 * `color-background-inverse`.
 */
export const AllVariants: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Matrix
      rows={VARIANTS}
      columns={['48']}
      render={(row) => (
        <IconButton icon="heart" label="좋아요" variant={row as IconButtonVariant} />
      )}
    />
  ),
};

/**
 * 48 is the documented size. 40 and 32 exist because the .pen instances resize
 * the component — the top navigation uses 40, modal close and file delete use 32.
 */
export const Sizes: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Matrix
      rows={VARIANTS}
      columns={['48', '40', '32']}
      render={(row, column) => (
        <IconButton
          icon="heart"
          label="좋아요"
          variant={row as IconButtonVariant}
          size={Number(column) as 32 | 40 | 48}
        />
      )}
    />
  ),
};
