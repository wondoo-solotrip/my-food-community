import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, userEvent } from 'storybook/test';

import { RegisterView } from './register-view';

const meta = {
  title: 'Pages/03 Register Page',
  component: RegisterView,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof RegisterView>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** 빈 폼 제출 시 사진·제목·내용·장소(지도 정보) 검증이 모두 걸린다(내용은 10자 이상). */
export const ValidationError: Story = {
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: '등록하기' }));
    await expect(canvas.getByText('사진을 1장 이상 올려주세요.')).toBeVisible();
    await expect(canvas.getByText('제목을 입력해주세요.')).toBeVisible();
    await expect(canvas.getByText('내용을 10자 이상 입력해주세요.')).toBeVisible();
    // 지도 정보는 필수 — 지도에서 장소를 확정하지 않으면 등록이 막힌다.
    await expect(canvas.getByText('지도에서 장소를 입력해주세요.')).toBeVisible();

    // 다시 입력하기 시작하면 해당 필드의 에러 표시(에러색 텍스트 포함)가 바로 풀린다.
    await userEvent.type(canvas.getByLabelText('제목'), '골목집');
    await expect(canvas.queryByText('제목을 입력해주세요.')).not.toBeInTheDocument();
    await userEvent.type(canvas.getByLabelText('내용'), '숨');
    await expect(
      canvas.queryByText('내용을 10자 이상 입력해주세요.'),
    ).not.toBeInTheDocument();
  },
};

/**
 * `.pen` 06→07→08 — "장소 입력하기"를 누르면 지도(07)가 먼저 열리고,
 * 지도 위 검색 필드를 눌러야 장소 검색(08)으로 전환된다.
 */
export const OpenPlaceFlow: Story = {
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: '장소 입력하기' }));
    await expect(canvas.getByRole('dialog', { name: '장소 등록' })).toBeVisible();
    // 선택 전에는 등록 버튼이 비활성이다.
    await expect(canvas.getByRole('button', { name: '이 위치로 등록하기' })).toBeDisabled();

    await userEvent.click(canvas.getByRole('button', { name: '장소 검색' }));
    await expect(canvas.getByRole('dialog', { name: '장소 검색' })).toBeVisible();
    await expect(
      canvas.getByText('네이버에서 장소명과 주소를 검색합니다.'),
    ).toBeVisible();
  },
};
