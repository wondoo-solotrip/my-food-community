import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect } from 'storybook/test';

import type { PlaceSummary } from '@/lib/places';

import { MyView } from './my-view';

/** `GET /api/my/places` 응답 모양 그대로 주입하는 데모 데이터. */
const MY_PLACES: PlaceSummary[] = [
  {
    id: '5b3f0d5c-1d3a-4e08-9a56-6a1b6f6a0001',
    title: '골목 끝 화덕 생선구이',
    content: '시장 뒷골목 안쪽이라 검색으로는 잘 안 보이지만, 점심시간마다 동네 가족 손님이 먼저 차는 곳이에요.',
    address: '등록 대기중',
    createdAt: '2026-07-28T12:00:00+09:00',
    imageUrl: '/images/grilled-fish-thumb.png',
    imageCount: 5,
  },
  {
    id: '5b3f0d5c-1d3a-4e08-9a56-6a1b6f6a0002',
    title: '비 오는 날 시흥 손칼국수',
    content: '비 오는 날이면 동네 어르신들이 줄을 서는 집이에요. 멸치 육수를 하루 전날부터 우려냅니다.',
    address: '등록 대기중',
    createdAt: '2026-07-21T12:00:00+09:00',
    imageUrl: '/images/kalguksu-rainy.png',
    imageCount: 3,
  },
  {
    id: '5b3f0d5c-1d3a-4e08-9a56-6a1b6f6a0003',
    title: '광명 밤일마을 작은 카페',
    content: '마을 안길 끝, 오래된 창고를 고친 카페예요. 팥빙수와 커피 두 가지가 전부입니다.',
    address: '등록 대기중',
    createdAt: '2026-07-14T12:00:00+09:00',
    imageUrl: '/images/bamil-cafe.png',
    imageCount: 4,
  },
];

const meta = {
  title: 'Pages/05 My Page',
  component: MyView,
  parameters: { layout: 'fullscreen' },
  args: { initialPlaces: MY_PLACES },
} satisfies Meta<typeof MyView>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Content: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('heading', { name: '맛집사냥꾼' })).toBeVisible();
    await expect(canvas.getByRole('heading', { name: '내가 쓴 글 3' })).toBeVisible();
    await expect(canvas.getAllByRole('link')).toHaveLength(3);
    await expect(canvas.getByText('2026. 07. 28')).toBeVisible();
    // 카드마다 소프트삭제 X 버튼이 붙는다.
    await expect(canvas.getAllByRole('button', { name: /삭제$/ })).toHaveLength(3);
    await expect(canvas.getByRole('button', { name: '로그아웃' })).toBeEnabled();
  },
};

export const Empty: Story = {
  args: { initialPlaces: [] },
  play: async ({ canvas }) => {
    await expect(canvas.getByText('아직 작성한 글이 없어요')).toBeVisible();
    await expect(canvas.getByRole('button', { name: '맛집 등록' })).toBeVisible();
  },
};

export const EditProfile: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: '프로필 수정' }));
    await expect(canvas.getByRole('dialog', { name: '프로필 수정' })).toBeVisible();
    await expect(canvas.getByRole('textbox', { name: '닉네임' })).toHaveValue('맛집사냥꾼');
  },
};
