import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { Chip, type ChipSize, type ChipState } from './Chip';
import { ICON_NAMES } from './Icon';
import { Matrix, Stack } from './docs/Matrix';

const STATES: ChipState[] = ['default', 'disabled'];
const SIZES: { size: ChipSize; label: string }[] = [
  { size: 'sm', label: 'sm (24)' },
  { size: 'md', label: 'md (32)' },
];

const meta = {
  title: 'Components/Chip',
  component: Chip,
  tags: ['autodocs'],
  args: { label: '분위기 좋은', selected: false, state: 'default', size: 'md', leadingIcon: 'plus' },
  argTypes: {
    state: { control: 'inline-radio', options: STATES },
    size: { control: 'inline-radio', options: ['sm', 'md'] },
    leadingIcon: { control: 'select', options: [undefined, ...ICON_NAMES] },
  },
} satisfies Meta<typeof Chip>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/** The 8 `.pen` components. */
export const AllVariants: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Stack>
      {SIZES.map(({ size, label }) => (
        <Matrix
          key={size}
          caption={label}
          rows={['unselected', 'selected']}
          columns={STATES}
          render={(row, column) => (
            <Chip
              label="분위기 좋은"
              selected={row === 'selected'}
              state={column as ChipState}
              size={size}
              leadingIcon="plus"
            />
          )}
        />
      ))}
    </Stack>
  ),
};

/**
 * The padding rule: dropping the icon widens the left padding back to match the
 * right (sm 6→12, md 8→16), which keeps the label optically centred either way.
 */
export const IconPadding: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Matrix
      rows={['sm', 'md']}
      columns={['아이콘 있음', '아이콘 없음']}
      render={(row, column) => (
        <Chip
          label="분위기 좋은"
          size={row as ChipSize}
          leadingIcon={column === '아이콘 있음' ? 'plus' : undefined}
        />
      )}
    />
  ),
};
