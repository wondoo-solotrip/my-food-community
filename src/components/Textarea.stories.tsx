import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { Textarea } from './Textarea';
import { Matrix } from './docs/Matrix';
import { FIELD_STATES, type FieldState } from './field';

const FILLED = '골목 끝 화덕에서 구운 생선과\n따뜻한 반찬이 인상적이었어요.';

const meta = {
  title: 'Components/Textarea',
  component: Textarea,
  tags: ['autodocs'],
  args: {
    label: '추천 이유',
    placeholder: '추천하는 이유를 20자 이상 작성해 주세요.',
    helper: '다른 사람이 이해하기 쉽게 작성해 주세요.',
    errorMessage: '추천 이유를 20자 이상 작성해 주세요.',
    state: 'default',
    showCounter: true,
    maxLength: 500,
  },
  argTypes: {
    state: { control: 'inline-radio', options: FIELD_STATES },
  },
  decorators: [
    (Story) => (
      <div className="w-[300px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Textarea>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/**
 * Four states, one size. There is no type axis ("타입: 없음"), so the row labels are
 * hidden and only the state columns remain.
 */
export const AllVariants: Story = {
  parameters: { controls: { disable: true } },
  decorators: [],
  render: () => (
    <Matrix
      rows={['textarea']}
      hideRowLabels
      columns={FIELD_STATES}
      render={(_row, column) => {
        const state = column as FieldState;
        const filled = state === 'focused' || state === 'error';
        return (
          <div className="w-[260px]">
            <Textarea
              state={state}
              label="추천 이유"
              placeholder="추천하는 이유를 20자 이상 작성해 주세요."
              defaultValue={filled ? FILLED : undefined}
              helper="다른 사람이 이해하기 쉽게 작성해 주세요."
              errorMessage="추천 이유를 20자 이상 작성해 주세요."
              showCounter
            />
          </div>
        );
      }}
    />
  ),
};

/** The counter is optional; the helper row collapses to just the hint. */
export const WithoutCounter: Story = {
  args: { showCounter: false },
};
