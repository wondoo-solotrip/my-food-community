import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { AddressRow } from './AddressRow';
import { Matrix } from './docs/Matrix';

const meta = {
  title: 'Components/Address Row',
  component: AddressRow,
  tags: ['autodocs'],
  args: {
    text: '서울특별시 마포구 동교로38길 27, 1층',
    tone: 'default',
  },
  argTypes: {
    tone: { control: 'inline-radio', options: ['default', 'secondary'] },
  },
  decorators: [
    (Story) => (
      <div className="w-[320px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof AddressRow>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/** 상세(10)는 `default`, 장소 등록(07)은 `secondary` 텍스트 톤을 쓴다. */
export const Tones: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Matrix
      rows={['tone']}
      hideRowLabels
      columns={['default', 'secondary']}
      render={(_row, column) => (
        <div className="w-[280px]">
          <AddressRow
            text="서울특별시 중구 세종대로 110"
            tone={column as 'default' | 'secondary'}
          />
        </div>
      )}
    />
  ),
};
