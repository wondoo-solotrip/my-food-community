import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';

import { EmptyState } from './EmptyState';
import { Stack } from './docs/Matrix';

const meta = {
  title: 'Components/Empty State',
  component: EmptyState,
  tags: ['autodocs'],
  args: {
    visual: 'image',
    title: '아직 등록된 맛집이 없어요',
    description: '동네에서 발견한 숨은 맛집을 가장 먼저 소개해 주세요.',
    primaryAction: { label: '맛집 등록', onClick: fn() },
    secondaryAction: { label: '둘러보기', onClick: fn() },
  },
  decorators: [
    (Story) => (
      <div className="w-[360px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof EmptyState>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/**
 * Everything except the heading is optional. The action row is fixed by the guide
 * at one secondary plus one primary button, secondary first.
 */
export const OptionalParts: Story = {
  parameters: { controls: { disable: true } },
  decorators: [],
  render: () => (
    <Stack>
      {[
        { caption: '전체', visual: true, description: true, actions: true },
        { caption: '비주얼 없음', visual: false, description: true, actions: true },
        { caption: '설명 없음', visual: true, description: false, actions: true },
        { caption: '제목만', visual: false, description: false, actions: false },
      ].map(({ caption, visual, description, actions }) => (
        <div key={caption} className="w-[360px] border border-border-default">
          <h3 className="border-b border-border-default px-4 py-2 text-[11px] font-semibold tracking-wide text-text-subtle uppercase">
            {caption}
          </h3>
          <EmptyState
            visual={visual ? 'image' : undefined}
            title="아직 등록된 맛집이 없어요"
            description={
              description ? '동네에서 발견한 숨은 맛집을 가장 먼저 소개해 주세요.' : undefined
            }
            primaryAction={actions ? { label: '맛집 등록', onClick: fn() } : undefined}
            secondaryAction={actions ? { label: '둘러보기', onClick: fn() } : undefined}
          />
        </div>
      ))}
    </Stack>
  ),
};
