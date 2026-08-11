import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';

import { Toast, type ToastType } from './Toast';
import { Matrix, Stack } from './docs/Matrix';

const TYPES: ToastType[] = ['success', 'error', 'info', 'warning'];

/** Message copy the design file ships per type. */
const MESSAGE: Record<ToastType, string> = {
  success: '저장이 완료되었습니다.',
  error: '요청을 처리하지 못했습니다.',
  info: '새로운 업데이트가 있습니다.',
  warning: '입력한 내용을 다시 확인해 주세요.',
};

const meta = {
  title: 'Components/Toast',
  component: Toast,
  tags: ['autodocs'],
  args: {
    type: 'success',
    message: '저장이 완료되었습니다.',
    viewport: 'mobile',
    onClose: fn(),
  },
  argTypes: {
    type: { control: 'inline-radio', options: TYPES },
    viewport: { control: 'inline-radio', options: ['mobile', 'desktop'] },
  },
  decorators: [
    (Story) => (
      <div className="w-[324px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Toast>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/**
 * The 8 `.pen` components. Mobile fills the container minus its margins (324 in a
 * 360 frame); desktop is a fixed 400.
 */
export const AllVariants: Story = {
  parameters: { controls: { disable: true } },
  decorators: [],
  render: () => (
    <Stack>
      {(['mobile', 'desktop'] as const).map((viewport) => (
        <Matrix
          key={viewport}
          caption={viewport === 'mobile' ? 'mobile (화면 너비 − 마진)' : 'desktop (400)'}
          rows={['toast']}
          hideRowLabels
          columns={TYPES}
          render={(_row, column) => {
            const type = column as ToastType;
            return (
              <div className={viewport === 'mobile' ? 'w-[324px]' : undefined}>
                <Toast type={type} message={MESSAGE[type]} viewport={viewport} onClose={fn()} />
              </div>
            );
          }}
        />
      ))}
    </Stack>
  ),
};

/** The close affordance is optional. */
export const WithoutClose: Story = {
  args: { onClose: undefined },
};

/**
 * A long message wraps instead of clipping — the box grows past its 56px
 * minimum, matching the 64px two-line summary on the register page.
 */
export const Multiline: Story = {
  args: {
    type: 'error',
    message: '등록하지 못했어요 · 사진, 추천 이유, 주소를 확인해 주세요.',
  },
};
