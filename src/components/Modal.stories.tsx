import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';

import { Modal } from './Modal';

const meta = {
  title: 'Components/Modal',
  component: Modal,
  tags: ['autodocs'],
  args: {
    title: '맛집을 삭제할까요?',
    children: '삭제한 맛집 정보는 다시 복구할 수 없습니다. 계속 진행하시겠어요?',
    primaryAction: { label: '확인', onClick: fn() },
    secondaryAction: { label: '취소', onClick: fn() },
    onClose: fn(),
    position: 'absolute',
  },
  argTypes: {
    position: { control: 'inline-radio', options: ['absolute', 'fixed'] },
  },
  // `.pen` draws the modal inside a 360×320 phone frame; the story mirrors that
  // so the scrim has bounds instead of covering the whole Storybook canvas.
  decorators: [
    (Story) => (
      <div className="relative h-[320px] w-[360px] overflow-hidden border border-border-default bg-background-default">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Modal>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/**
 * Header, body and footer over a `color-overlay-dark-50` scrim. Tapping the scrim
 * closes; the header's close button gives keyboard users the same exit.
 */
export const Default: Story = {};

/** Footer actions are optional — a purely informational dialog drops them. */
export const WithoutActions: Story = {
  args: { primaryAction: undefined, secondaryAction: undefined },
};
