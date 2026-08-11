import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { Select, SelectItem, SelectList } from './Select';
import { Matrix, Stack } from './docs/Matrix';
import { FIELD_SIZES, FIELD_SIZE_LABEL, FIELD_STATES, type FieldSize, type FieldState } from './field';

const meta = {
  title: 'Components/Select',
  component: Select,
  tags: ['autodocs'],
  args: {
    label: '지역 선택',
    placeholder: '지역을 선택하세요',
    helper: '가까운 지역을 선택해 주세요.',
    errorMessage: '지역을 선택해 주세요.',
    size: 'md',
    state: 'default',
  },
  argTypes: {
    size: { control: 'inline-radio', options: FIELD_SIZES },
    state: { control: 'inline-radio', options: FIELD_STATES },
  },
  decorators: [
    (Story) => (
      <div className="w-[300px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Select>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/**
 * The 12 `.pen` components. FOCUSED means the option panel is open — which is why
 * that column shows a chosen value and a flipped chevron.
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
          rows={['select']}
          hideRowLabels
          columns={FIELD_STATES}
          render={(_row, column) => {
            const state = column as FieldState;
            const open = state === 'focused';
            return (
              <div className="w-[240px]">
                <Select
                  size={size as FieldSize}
                  state={state}
                  open={open}
                  label="지역 선택"
                  placeholder="지역을 선택하세요"
                  value={open || state === 'error' ? '구로구' : undefined}
                  helper={open ? '옵션 패널이 열려 있습니다.' : '가까운 지역을 선택해 주세요.'}
                  errorMessage="지역을 선택해 주세요."
                />
              </div>
            );
          }}
        />
      ))}
    </Stack>
  ),
};

/**
 * How the two families compose. On desktop the list sits directly under the
 * trigger; on mobile the same items go into a bottom sheet.
 */
export const WithOpenPanel: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex w-[300px] flex-col gap-1">
      <Select
        label="지역 선택"
        value="영등포구"
        open
        listboxId="region-listbox"
        helper="옵션 패널이 열려 있습니다."
        state="focused"
      />
      <SelectList
        id="region-listbox"
        label="지역"
        className="overflow-hidden rounded-xl border border-border-default"
      >
        <SelectItem label="구로구" />
        <SelectItem label="영등포구" state="selected" />
        <SelectItem label="금천구" />
        <SelectItem label="관악구 (준비 중)" state="disabled" />
      </SelectList>
    </div>
  ),
};
