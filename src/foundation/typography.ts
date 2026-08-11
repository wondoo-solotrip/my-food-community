/**
 * Typography tokens, mirrored from design.pen `variables` and the ten
 * `Typography / *` components. Keep in step with globals.css.
 */

export interface PrimitiveEntry {
  token: string;
  value: string;
  note?: string;
}

export const FONT_FAMILY = {
  token: 'font-family',
  value: 'Pretendard Variable',
  file: '/fonts/PretendardVariable.woff2',
  /** Variable font: one file covers the whole 400–700 range. */
  weightRange: '400 700',
};

export const FONT_SIZES: PrimitiveEntry[] = [
  { token: 'font-size-900', value: '40px', note: '정의되어 있으나 현재 타입 스타일에서 미사용' },
  { token: 'font-size-800', value: '36px' },
  { token: 'font-size-700', value: '32px' },
  { token: 'font-size-600', value: '28px' },
  { token: 'font-size-500', value: '24px' },
  { token: 'font-size-400', value: '20px' },
  { token: 'font-size-300', value: '16px' },
  { token: 'font-size-200', value: '14px' },
  { token: 'font-size-100', value: '12px' },
];

export const FONT_WEIGHTS: PrimitiveEntry[] = [
  { token: 'font-weight-bold', value: '700' },
  { token: 'font-weight-semibold', value: '600' },
  { token: 'font-weight-regular', value: '400' },
];

export const LINE_HEIGHTS: PrimitiveEntry[] = [
  { token: 'font-line-height-tight', value: '1.2', note: 'display · heading' },
  { token: 'font-line-height-normal', value: '1.4', note: 'body · label' },
];

export const LETTER_SPACING: PrimitiveEntry = {
  token: 'font-letter-spacing-tight',
  value: '-0.02em',
  note: '전 스타일 공통 -2%',
};

export interface TypeStyle {
  /** Style name as used in the design file, e.g. `display-lg`. */
  name: string;
  /** Tailwind utility that applies the whole style. */
  utility: string;
  sizeToken: string;
  sizePx: number;
  weightToken: string;
  weight: number;
  lineHeightToken: string;
  lineHeight: number;
  /** Tracking in px at this size — what the .pen stores per text node. */
  letterSpacingPx: number;
  /** Specimen copy, taken verbatim from the .pen component. */
  sample: string;
  usage: string;
}

const style = (
  name: string,
  sizeToken: string,
  sizePx: number,
  weightToken: string,
  weight: number,
  tight: boolean,
  sample: string,
  usage: string,
): TypeStyle => ({
  name,
  utility: `type-${name}`,
  sizeToken,
  sizePx,
  weightToken,
  weight,
  lineHeightToken: tight ? 'font-line-height-tight' : 'font-line-height-normal',
  lineHeight: tight ? 1.2 : 1.4,
  letterSpacingPx: Math.round(sizePx * -0.02 * 100) / 100,
  sample,
  usage,
});

export const TYPE_STYLES: TypeStyle[] = [
  style('display-lg', 'font-size-800', 36, 'font-weight-bold', 700, true,
    'display-lg · 함께 나누는 식탁의 온도', '랜딩 히어로 타이틀'),
  style('display-md', 'font-size-700', 32, 'font-weight-bold', 700, true,
    'display-md · 오늘의 맛을 발견하는 순간', '페이지 최상위 타이틀'),
  style('display-sm', 'font-size-600', 28, 'font-weight-bold', 700, true,
    'display-sm · 동네의 좋은 식탁을 만나요', '주요 섹션 타이틀'),
  style('heading-lg', 'font-size-500', 24, 'font-weight-bold', 700, true,
    'heading-lg · 함께 만드는 음식 이야기', '섹션 제목'),
  style('heading-md', 'font-size-400', 20, 'font-weight-bold', 700, true,
    'heading-md · 지금 가장 따뜻한 레시피', '서브 섹션 제목'),
  style('heading-sm', 'font-size-300', 16, 'font-weight-semibold', 600, true,
    'heading-sm · 우리 동네 푸드 커뮤니티', '카드 제목, 리스트 헤더'),
  style('body-lg', 'font-size-300', 16, 'font-weight-regular', 400, false,
    'body-lg · 좋아하는 음식을 기록하고 이웃과 경험을 나눠보세요.', '본문 기본'),
  style('body-md', 'font-size-200', 14, 'font-weight-regular', 400, false,
    'body-md · 제철 재료와 다정한 레시피가 매일의 식탁을 채웁니다.', '보조 본문, 카드 설명'),
  style('label-lg', 'font-size-200', 14, 'font-weight-semibold', 600, false,
    'label-lg · 레시피 저장', '버튼 라벨, 탭 라벨'),
  style('label-md', 'font-size-100', 12, 'font-weight-regular', 400, false,
    'label-md · 12분 전 업데이트', '메타 정보, 캡션'),
];
