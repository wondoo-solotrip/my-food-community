import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';

import { BottomSheet } from './BottomSheet';
import { PwaInstallBanner, PwaInstallIosGuide } from './PwaInstallBanner';

const meta = {
  title: 'Components/Pwa Install Banner',
  component: PwaInstallBanner,
  tags: ['autodocs'],
  args: {
    appName: '구로 맛집 지도',
    description: '홈 화면에 추가해 앱처럼 쓰세요',
    ctaLabel: '설치',
    onInstall: fn(),
    onDismiss: fn(),
    position: 'static',
  },
  argTypes: {
    position: { control: 'inline-radio', options: ['static', 'fixed'] },
  },
} satisfies Meta<typeof PwaInstallBanner>;

export default meta;

type Story = StoryObj<typeof meta>;

/** 안드로이드: 띠를 누르면 바로 네이티브 설치 프롬프트(`beforeinstallprompt`)를 띄운다. */
export const Playground: Story = {};

/** iOS: 설치 프롬프트가 없어 CTA 문구를 가이드 진입으로 바꾼다. */
export const Ios: Story = {
  args: { ctaLabel: '설치 방법' },
};

/** iOS에서 띠를 누르면 열리는 설치 가이드. `BottomSheet`를 재사용한다. */
export const IosGuideSheet: Story = {
  decorators: [
    (Story) => (
      <div className="relative h-[420px] w-[360px] overflow-hidden border border-border-default bg-background-default">
        <Story />
      </div>
    ),
  ],
  render: (args) => (
    <>
      <PwaInstallBanner {...args} className="absolute" position="static" />
      <BottomSheet
        title="홈 화면에 추가하기"
        description="Safari에서 아래 순서대로 진행하면 앱처럼 설치돼요."
        position="absolute"
        onClose={fn()}
      >
        <PwaInstallIosGuide />
      </BottomSheet>
    </>
  ),
};
