import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn } from 'storybook/test';

import { ProfileEditSheet } from './profile-edit-sheet';

const meta = {
  title: 'Pages/05 My Page/Profile Edit Sheet',
  component: ProfileEditSheet,
  parameters: { layout: 'fullscreen' },
  args: {
    initialNickname: '맛집사냥꾼',
    initialImageUrl: null,
    onClose: fn(),
    onSaved: fn(),
  },
} satisfies Meta<typeof ProfileEditSheet>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Content: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('dialog', { name: '프로필 수정' })).toBeVisible();
    await expect(canvas.getByRole('textbox', { name: '닉네임' })).toHaveValue('맛집사냥꾼');
    await expect(canvas.getByRole('button', { name: '사진 변경' })).toBeEnabled();
    await expect(canvas.getByRole('button', { name: '저장' })).toBeEnabled();
    await expect(canvas.getByRole('button', { name: '취소' })).toBeEnabled();
  },
};

export const EmptyNicknameError: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.clear(canvas.getByRole('textbox', { name: '닉네임' }));
    await userEvent.click(canvas.getByRole('button', { name: '저장' }));
    await expect(canvas.getByText('닉네임을 입력해주세요.')).toBeVisible();
  },
};
