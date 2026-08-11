import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { Switch, type SwitchSize, type SwitchState } from './Switch';
import { Matrix, Stack } from './docs/Matrix';

const STATES: SwitchState[] = ['default', 'disabled'];
const SIZES: { size: SwitchSize; label: string }[] = [
  { size: 'sm', label: 'sm (32 × 16)' },
  { size: 'md', label: 'md (40 × 20)' },
];

const meta = {
  title: 'Components/Switch',
  component: Switch,
  tags: ['autodocs'],
  args: { label: '추천 알림 사용', checked: false, state: 'default', size: 'md' },
  argTypes: {
    state: { control: 'inline-radio', options: STATES },
    size: { control: 'inline-radio', options: ['sm', 'md'] },
  },
} satisfies Meta<typeof Switch>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/**
 * The 8 `.pen` components. Note the OFF track: the design uses
 * `color-background-inverse`, a dark neutral, rather than a grey tint.
 */
export const AllVariants: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Stack>
      {SIZES.map(({ size, label }) => (
        <Matrix
          key={size}
          caption={label}
          rows={['off', 'on']}
          columns={STATES}
          render={(row, column) => (
            <Switch
              label="추천 알림 사용"
              checked={row === 'on'}
              state={column as SwitchState}
              size={size}
            />
          )}
        />
      ))}
    </Stack>
  ),
};
