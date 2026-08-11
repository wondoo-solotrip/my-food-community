import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { SelectItem, type SelectItemState } from './Select';
import { Matrix, Stack } from './docs/Matrix';
import { FIELD_SIZES, FIELD_SIZE_LABEL, type FieldSize } from './field';

const STATES: SelectItemState[] = ['default', 'selected', 'disabled'];

const meta = {
  title: 'Components/Select Item',
  component: SelectItem,
  tags: ['autodocs'],
  args: { label: '영등포구', state: 'default', size: 'md' },
  argTypes: {
    state: { control: 'inline-radio', options: STATES },
    size: { control: 'inline-radio', options: FIELD_SIZES },
  },
  decorators: [
    (Story) => (
      <div className="w-[300px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SelectItem>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/**
 * The 9 `.pen` components. The check glyph stays mounted at zero opacity when
 * unselected, so the label never shifts as the selection moves down the list.
 */
export const AllVariants: Story = {
  parameters: { controls: { disable: true } },
  decorators: [],
  render: () => (
    <Stack>
      {FIELD_SIZES.map((size) => (
        <Matrix
          key={size}
          caption={FIELD_SIZE_LABEL[size]}
          rows={['select item']}
          hideRowLabels
          columns={STATES}
          render={(_row, column) => (
            <div className="w-[220px]">
              <SelectItem
                label="영등포구"
                state={column as SelectItemState}
                size={size as FieldSize}
              />
            </div>
          )}
        />
      ))}
    </Stack>
  ),
};
