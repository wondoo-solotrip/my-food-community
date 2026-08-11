import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { ICON_NAMES, Icon } from './Icon';
import { Matrix } from './docs/Matrix';

const meta = {
  title: 'Components/Icon',
  component: Icon,
  tags: ['autodocs'],
  args: { name: 'heart', size: 24 },
  argTypes: {
    name: { control: 'select', options: ICON_NAMES },
    size: { control: 'inline-radio', options: [16, 20, 24, 32] },
  },
} satisfies Meta<typeof Icon>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/**
 * The full 36-glyph catalog lives on the **Foundation / Iconography** page. This
 * story only shows that the component honours the four shipped sizes and takes
 * its colour from the surrounding `text-*` token via `currentColor`.
 */
export const SizesAndColour: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Matrix
      rows={Object.keys(TONE)}
      columns={['16', '20', '24', '32']}
      render={(row, column) => (
        <span className={TONE[row]}>
          <Icon name="bookmark" size={Number(column)} />
        </span>
      )}
    />
  ),
};

/** Literal classes: Tailwind's scanner cannot see a computed `text-text-${…}`. */
const TONE: Record<string, string> = {
  default: 'text-text-default',
  brand: 'text-text-brand',
  error: 'text-text-error',
  disabled: 'text-text-disabled',
};
