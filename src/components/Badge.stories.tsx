import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { Badge, type BadgeSize, type BadgeType } from './Badge';
import { Matrix } from './docs/Matrix';

const TYPES: BadgeType[] = ['neutral', 'success', 'error', 'info', 'warning'];

/** Label copy from the design file. */
const LABEL: Record<BadgeType, string> = {
  neutral: '기본',
  success: '완료',
  error: '오류',
  info: '안내',
  warning: '주의',
};

const meta = {
  title: 'Components/Badge',
  component: Badge,
  tags: ['autodocs'],
  args: { label: '기본', type: 'neutral', size: 'md' },
  argTypes: {
    type: { control: 'inline-radio', options: TYPES },
    size: { control: 'inline-radio', options: ['md', 'lg'] },
  },
} satisfies Meta<typeof Badge>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/**
 * The 10 `.pen` components. Both sizes keep 8px horizontal padding — only the
 * height changes (20 → 24). NEUTRAL is solid; the four status types are outlined.
 */
export const AllVariants: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Matrix
      rows={TYPES}
      columns={['md (20)', 'lg (24)']}
      render={(row, column) => {
        const type = row as BadgeType;
        return (
          <Badge
            label={LABEL[type]}
            type={type}
            size={column.startsWith('md') ? ('md' as BadgeSize) : ('lg' as BadgeSize)}
          />
        );
      }}
    />
  ),
};

/**
 * `filled` — 외곽선 대신 상태색 배경으로 채운 변형. 외곽선 버튼(결제 취소 등)
 * 옆에서 배지가 버튼처럼 읽히지 않아야 할 때 쓴다.
 */
export const Filled: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Matrix
      rows={TYPES}
      columns={['md (20)', 'lg (24)']}
      render={(row, column) => {
        const type = row as BadgeType;
        return (
          <Badge
            label={LABEL[type]}
            type={type}
            filled
            size={column.startsWith('md') ? ('md' as BadgeSize) : ('lg' as BadgeSize)}
          />
        );
      }}
    />
  ),
};
