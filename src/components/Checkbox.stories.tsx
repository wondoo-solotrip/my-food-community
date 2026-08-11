import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import {
  Checkbox,
  type CheckboxSelection,
  type CheckboxSize,
  type CheckboxState,
} from './Checkbox';
import { Matrix, Stack } from './docs/Matrix';

const SELECTIONS: CheckboxSelection[] = ['unchecked', 'checked', 'indeterminate'];
const STATES: CheckboxState[] = ['default', 'disabled', 'error'];
const SIZES: { size: CheckboxSize; label: string }[] = [
  { size: 'sm', label: 'sm (16)' },
  { size: 'md', label: 'md (20)' },
];

const meta = {
  title: 'Components/Checkbox',
  component: Checkbox,
  tags: ['autodocs'],
  args: { label: '선택 항목 레이블', selection: 'unchecked', state: 'default', size: 'md' },
  argTypes: {
    selection: { control: 'inline-radio', options: SELECTIONS },
    state: { control: 'inline-radio', options: STATES },
    size: { control: 'inline-radio', options: ['sm', 'md'] },
  },
} satisfies Meta<typeof Checkbox>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/**
 * The 18 `.pen` components. The design has two independent axes here — selection
 * (unchecked / checked / indeterminate) on rows and state on columns — so the
 * matrix uses selection as its "타입".
 */
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
            <Checkbox
              label="선택 항목 레이블"
              selection={row as CheckboxSelection}
              state={column as CheckboxState}
              size={size}
            />
          )}
        />
      ))}
    </Stack>
  ),
};

/**
 * Checkboxes may stand alone or form a group. In a group the error message is
 * shown once under the whole form, not per row, per the guide.
 */
export const Group: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <fieldset className="flex flex-col gap-2">
      <legend className="type-label-lg mb-2 text-text-default">관심 카테고리</legend>
      <Checkbox label="한식" selection="checked" state="error" />
      <Checkbox label="분식" selection="unchecked" state="error" />
      <Checkbox label="카페" selection="unchecked" state="error" />
      <p className="type-label-md mt-1 text-text-error">최소 1개 이상 선택해 주세요.</p>
    </fieldset>
  ),
};
