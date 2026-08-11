import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect } from 'storybook/test';

import { LoginView } from './login-view';

const meta = {
  title: 'Pages/04 Login Page',
  component: LoginView,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof LoginView>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Content: Story = {
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('heading', { name: /이번 주말/ }),
    ).toBeVisible();
    await expect(canvas.getByRole('button', { name: /Google로 시작하기/ })).toBeEnabled();
  },
};
