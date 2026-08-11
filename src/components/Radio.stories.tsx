import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { Radio, RadioGroup, type RadioSize, type RadioState } from './Radio';
import { Matrix, Stack } from './docs/Matrix';

const SELECTIONS = ['unselected', 'selected'] as const;
const STATES: RadioState[] = ['default', 'disabled'];
const SIZES: { size: RadioSize; label: string }[] = [
  { size: 'sm', label: 'sm (16)' },
  { size: 'md', label: 'md (20)' },
];

const meta = {
  title: 'Components/Radio',
  component: Radio,
  tags: ['autodocs'],
  args: { label: '첫 번째 선택지', selected: false, state: 'default', size: 'md' },
  argTypes: {
    state: { control: 'inline-radio', options: STATES },
    size: { control: 'inline-radio', options: ['sm', 'md'] },
  },
} satisfies Meta<typeof Radio>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/** The 8 `.pen` components. There is no error state for radios by design. */
export const AllVariants: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Stack>
      {SIZES.map(({ size, label }) => (
        <Matrix
          key={size}
          caption={label}
          rows={SELECTIONS}
          columns={STATES}
          render={(row, column) => (
            <Radio
              label="첫 번째 선택지"
              selected={row === 'selected'}
              state={column as RadioState}
              size={size}
            />
          )}
        />
      ))}
    </Stack>
  ),
};

/**
 * The supported shape. The guide forbids a standalone radio ("단독 사용 금지"), so
 * `RadioGroup` carries the accessible name and the `radiogroup` role.
 */
export const InGroup: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <RadioGroup label="정렬 기준">
      <Radio label="최신순" selected />
      <Radio label="인기순" />
      <Radio label="거리순" />
      <Radio label="평점순 (준비 중)" state="disabled" />
    </RadioGroup>
  ),
};
