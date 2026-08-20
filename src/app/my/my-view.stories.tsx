import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect } from 'storybook/test';

import type { CanceledHistoryItem, PaymentHistoryItem } from '@/lib/events';
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

/** `GET /api/my/payments` 응답 모양 그대로 주입하는 데모 데이터 — design.pen 13·14. */
const MY_PAYMENTS: PaymentHistoryItem[] = [
  {
    id: '2f6f9b70-93a1-4a54-9b9e-1f30a4d20001',
    amount: 30000,
    paidAt: '2026-08-13T21:04:00+09:00',
    eventName: '8월 구로 미식 모임',
    eventAt: '2026-08-29T19:30:00+09:00',
    eventAddress: '구로시장 키친',
    imageUrl: '/images/guro-table-dinner.png',
  },
  {
    id: '2f6f9b70-93a1-4a54-9b9e-1f30a4d20003',
    amount: 25000,
    paidAt: '2026-08-10T18:12:00+09:00',
    eventName: '9월 문래 골목 미식회',
    eventAt: '2026-09-12T19:00:00+09:00',
    eventAddress: '문래동 철공소 키친',
    imageUrl: '/images/kalguksu.png',
  },
  {
    id: '2f6f9b70-93a1-4a54-9b9e-1f30a4d20004',
    amount: 40000,
    paidAt: '2026-08-05T09:40:00+09:00',
    eventName: '10월 오류동 김장 클래스',
    eventAt: '2026-10-17T11:00:00+09:00',
    eventAddress: '오류동 공유 부엌',
    imageUrl: '/images/bamil-cafe.png',
  },
];

const MY_CANCELED: CanceledHistoryItem[] = [
  {
    id: '2f6f9b70-93a1-4a54-9b9e-1f30a4d20002',
    amount: 25000,
    canceledAt: '2026-07-18T10:32:00+09:00',
    eventName: '7월 동네 식탁 이야기',
  },
];

const meta = {
  title: 'Pages/05 My Page',
  component: MyView,
  parameters: { layout: 'fullscreen' },
  args: {
    // 프로필을 주입해 스켈레톤 없이 바로 렌더링한다 — 앱에서는 계정·프로필
    // 응답이 올 때까지 스켈레톤이 유지된다.
    initialProfile: { nickname: '맛집사냥꾼', imageUrl: '/images/profile.png' },
    initialPlaces: MY_PLACES,
    initialPayments: MY_PAYMENTS,
    initialCanceled: MY_CANCELED,
  },
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
    // 카드마다 날짜 라인에 ⋮ 더보기 버튼이 붙는다.
    await expect(canvas.getAllByRole('button', { name: /더보기$/ })).toHaveLength(3);
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

/** ⋮ 더보기를 누르면 글 관리 바텀시트가 수정·삭제 버튼을 보여준다. */
export const PostActions: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(
      canvas.getByRole('button', { name: '골목 끝 화덕 생선구이 더보기' }),
    );
    await expect(canvas.getByRole('dialog', { name: '글 관리' })).toBeVisible();
    await expect(canvas.getByRole('button', { name: '수정' })).toBeEnabled();
    await expect(canvas.getByRole('button', { name: '삭제' })).toBeEnabled();
  },
};

export const EditProfile: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: '프로필 수정' }));
    await expect(canvas.getByRole('dialog', { name: '프로필 수정' })).toBeVisible();
    await expect(canvas.getByRole('textbox', { name: '닉네임' })).toHaveValue('맛집사냥꾼');
  },
};

/** design.pen 13 — 결제 내역 탭. 참여 확정 카드와 결제 취소 버튼. */
export const PaymentsTab: Story = {
  args: { initialTab: 1 },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('tab', { name: '결제 내역', selected: true })).toBeVisible();
    await expect(canvas.getByRole('heading', { name: '참여 예정 모임' })).toBeVisible();
    await expect(canvas.getByText('3건')).toBeVisible();
    await expect(canvas.getAllByText('참여 확정')).toHaveLength(3);
    await expect(canvas.getByText('8월 구로 미식 모임')).toBeVisible();
    await expect(canvas.getByText('9월 문래 골목 미식회')).toBeVisible();
    await expect(canvas.getByText('10월 오류동 김장 클래스')).toBeVisible();
    await expect(canvas.getByText('30,000원')).toBeVisible();
    await expect(canvas.getAllByRole('button', { name: '결제 취소' })).toHaveLength(3);
  },
};

/** design.pen 14 — 취소 내역 탭. 환불 완료 카드. */
export const CanceledTab: Story = {
  args: { initialTab: 2 },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('tab', { name: '취소 내역', selected: true })).toBeVisible();
    await expect(canvas.getByRole('heading', { name: '환불 완료 내역' })).toBeVisible();
    await expect(canvas.getByText('환불 완료')).toBeVisible();
    await expect(canvas.getByText('7월 동네 식탁 이야기')).toBeVisible();
    await expect(canvas.getByText('25,000원')).toBeVisible();
  },
};

/** 탭을 눌러 12 → 13 → 14 순서로 오간다. */
export const TabSwitching: Story = {
  play: async ({ canvas, userEvent }) => {
    await expect(canvas.getByRole('heading', { name: '내가 쓴 글 3' })).toBeVisible();
    await userEvent.click(canvas.getByRole('tab', { name: '결제 내역' }));
    await expect(canvas.getByRole('heading', { name: '참여 예정 모임' })).toBeVisible();
    await userEvent.click(canvas.getByRole('tab', { name: '취소 내역' }));
    await expect(canvas.getByRole('heading', { name: '환불 완료 내역' })).toBeVisible();
    await userEvent.click(canvas.getByRole('tab', { name: '내가 쓴 글' }));
    await expect(canvas.getByRole('heading', { name: '내가 쓴 글 3' })).toBeVisible();
  },
};

/** 결제·취소 내역이 없을 때의 빈 상태. */
export const PaymentsEmpty: Story = {
  args: { initialTab: 1, initialPayments: [], initialCanceled: [] },
  play: async ({ canvas }) => {
    await expect(canvas.getByText('아직 결제한 모임이 없어요')).toBeVisible();
    await expect(canvas.getByRole('button', { name: '모임 보러 가기' })).toBeVisible();
  },
};
