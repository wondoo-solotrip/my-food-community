/** Spacing tokens, mirrored from design.pen `variables`. */

export interface SpacingToken {
  token: string;
  px: number;
  /** Equivalent utility on Tailwind's native scale (`--spacing` × n). */
  tailwind: string;
  usage: string;
}

export const SPACING_TOKENS: SpacingToken[] = [
  { token: 'spacing-8', px: 8, tailwind: 'p-2 / gap-2', usage: '칩 나열' },
  { token: 'spacing-12', px: 12, tailwind: 'p-3 / gap-3', usage: '리스트·카드 갭' },
  { token: 'spacing-16', px: 16, tailwind: 'p-4 / gap-4', usage: '화면 좌우 마진, 카드 갭' },
  { token: 'spacing-20', px: 20, tailwind: 'p-5 / gap-5', usage: '가이드에 용도 미기재' },
  { token: 'spacing-24', px: 24, tailwind: 'p-6 / gap-6', usage: '섹션 구분' },
  { token: 'spacing-32', px: 32, tailwind: 'p-8 / gap-8', usage: '큰 섹션 구분, 페이지 상하 여백' },
];
