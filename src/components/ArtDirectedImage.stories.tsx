import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect } from 'storybook/test';

import { ArtDirectedImage } from './ArtDirectedImage';

const meta = {
  title: 'Components/ArtDirectedImage',
  component: ArtDirectedImage,
  args: {
    // 뷰포트를 1024px 경계로 오가면 원본이 바뀐다 — 데스크톱은 와인 테이블,
    // 모바일·태블릿은 디너 사진.
    srcLg: '/images/wine-table.png',
    srcMd: '/images/guro-table-dinner.png',
    alt: '아트 디렉션 데모',
    sizes: '(min-width: 640px) 640px, 100vw',
    className: 'object-cover',
  },
  decorators: [
    // fill 이미지 전용이라 스토리가 컨테이너(relative + 비율)를 제공한다.
    (Story) => (
      <div className="relative aspect-[3/2] w-full max-w-[640px] overflow-hidden rounded-2xl">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ArtDirectedImage>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Content: Story = {
  play: async ({ canvas }) => {
    const image = canvas.getByRole('img', { name: '아트 디렉션 데모' });
    await expect(image).toBeVisible();
    // 데스크톱 소스는 <source media>로 분리되어 있다.
    const source = image.closest('picture')?.querySelector('source');
    await expect(source).toHaveAttribute('media', '(min-width: 1024px)');
  },
};
