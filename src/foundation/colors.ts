/**
 * Colour tokens, mirrored from design.pen `variables`.
 *
 * Primitive hex values are the single source of truth here; semantic tokens
 * only ever name the primitive they reference, so a semantic swatch can never
 * drift from its primitive. Keep this file in step with globals.css.
 */

export interface PrimitiveStep {
  /** Scale position: `50`, `100`, … `950`. */
  step: string;
  /** Full design token name, e.g. `color-brand-500`. */
  token: string;
  hex: string;
}

export interface PrimitiveScale {
  /** Scale key as used in token names, e.g. `brand`. */
  key: string;
  label: string;
  role: string;
  steps: PrimitiveStep[];
}

const scale = (key: string, label: string, role: string, entries: [string, string][]): PrimitiveScale => ({
  key,
  label,
  role,
  steps: entries.map(([step, hex]) => ({ step, token: `color-${key}-${step}`, hex })),
});

export const PRIMITIVE_SCALES: PrimitiveScale[] = [
  scale('brand', 'Brand', '주요 액션, 브랜드 강조', [
    ['50', '#fff4ed'],
    ['100', '#ffe6d5'],
    ['200', '#ffc9aa'],
    ['300', '#ffa176'],
    ['400', '#ff7947'],
    ['500', '#f65a24'],
    ['600', '#d93e12'],
    ['700', '#b52d0d'],
    ['800', '#912612'],
    ['900', '#762316'],
    ['950', '#401007'],
  ]),
  scale('neutral', 'Neutral', '텍스트, 배경, 보더 (웜 그레이)', [
    ['0', '#ffffff'],
    ['50', '#fffdf9'],
    ['100', '#f8f3ed'],
    ['200', '#e9e2da'],
    ['300', '#d8d0c8'],
    ['400', '#aaa19a'],
    ['500', '#79736d'],
    ['600', '#5f5751'],
    ['700', '#4c4038'],
    ['800', '#2e2824'],
    ['900', '#1f1a17'],
    ['950', '#15110e'],
  ]),
  scale('red', 'Red', '에러 상태', [
    ['50', '#fff1f0'],
    ['100', '#ffe0dc'],
    ['200', '#ffc1b8'],
    ['300', '#ff9888'],
    ['400', '#f96c57'],
    ['500', '#e14d2a'],
    ['600', '#c7381d'],
    ['700', '#a52c18'],
    ['800', '#872719'],
    ['900', '#70251a'],
    ['950', '#3d0e08'],
  ]),
  scale('amber', 'Amber', '경고 상태', [
    ['50', '#fffbeb'],
    ['100', '#fef3c7'],
    ['200', '#fde68a'],
    ['300', '#fcd34d'],
    ['400', '#fbbf24'],
    ['500', '#f59e0b'],
    ['600', '#d97706'],
    ['700', '#b45309'],
    ['800', '#92400e'],
    ['900', '#78350f'],
    ['950', '#451a03'],
  ]),
  scale('teal', 'Teal', '성공 상태', [
    ['50', '#f0fdfa'],
    ['100', '#ccfbf1'],
    ['200', '#99f6e4'],
    ['300', '#5eead4'],
    ['400', '#2dd4bf'],
    ['500', '#14b8a6'],
    ['600', '#0d9488'],
    ['700', '#0f766e'],
    ['800', '#115e59'],
    ['900', '#134e4a'],
    ['950', '#042f2e'],
  ]),
  scale('blue', 'Blue', '정보 상태, 포커스', [
    ['50', '#eff6ff'],
    ['100', '#dbeafe'],
    ['200', '#bfdbfe'],
    ['300', '#93c5fd'],
    ['400', '#60a5fa'],
    ['500', '#3b82f6'],
    ['600', '#2563eb'],
    ['700', '#1d4ed8'],
    ['800', '#1e40af'],
    ['900', '#1e3a8a'],
    ['950', '#172554'],
  ]),
];

/** Translucent primitives. Not a 50–950 ramp, so they are listed separately. */
export const ALPHA_SCALES: PrimitiveScale[] = [
  scale('alpha-black', 'Alpha Black', '어두운 오버레이, 스크림', [
    ['0', '#00000000'],
    ['13', '#00000022'],
    ['30', '#0000004d'],
    ['50', '#00000080'],
    ['54', '#0000008a'],
    ['72', '#000000b8'],
    ['95', '#000000f2'],
  ]),
  scale('alpha-white', 'Alpha White', '밝은 오버레이, 유리 효과', [
    ['0', '#ffffff00'],
    ['6', '#ffffff10'],
    ['27', '#ffffff44'],
    ['60', '#ffffff99'],
  ]),
  scale('alpha-shadow', 'Alpha Shadow', '그림자 전용 웜톤 알파', [
    ['action', '#a23a1833'],
    ['header', '#4d24100a'],
    ['navigation', '#2d1a100d'],
    ['search', '#4b2a180d'],
  ]),
];

/** `brand-500` → `#f65a24`, for resolving semantic references. */
export const PRIMITIVE_HEX: Record<string, string> = Object.fromEntries(
  [...PRIMITIVE_SCALES, ...ALPHA_SCALES].flatMap((s) => s.steps.map((step) => [`${s.key}-${step.step}`, step.hex])),
);

export interface SemanticToken {
  /** Full token name, e.g. `color-text-default`. */
  token: string;
  /** Primitive it points at, e.g. `neutral-900`. */
  ref: string;
  usage: string;
  /**
   * Primitive this token is designed to sit on, when it is not the page
   * background. Contrast is meaningless measured against anything else —
   * `text-on-brand` belongs on `brand-700`, not on the light page.
   */
  on?: string;
  /** Exempt from a contrast minimum, e.g. disabled text (WCAG 2.1 §1.4.3). */
  exempt?: boolean;
}

export interface SemanticGroup {
  key: string;
  label: string;
  description: string;
  /** Which CSS property this group is meant to drive, for the preview column. */
  preview: 'text' | 'background' | 'border' | 'overlay';
  tokens: SemanticToken[];
}

const group = (
  key: string,
  label: string,
  description: string,
  preview: SemanticGroup['preview'],
  tokens: [string, string, string, string?, boolean?][],
): SemanticGroup => ({
  key,
  label,
  description,
  preview,
  tokens: tokens.map(([name, ref, usage, on, exempt]) => ({
    token: `color-${key}-${name}`,
    ref,
    usage,
    on,
    exempt,
  })),
});

export const SEMANTIC_GROUPS: SemanticGroup[] = [
  group('text', 'Text', '텍스트 색상. 각 토큰이 놓이도록 설계된 배경 기준으로 대비를 측정합니다.', 'text', [
    ['default', 'neutral-900', '화면 기본 텍스트, 제목'],
    ['strong', 'neutral-950', '최대 강조 텍스트'],
    ['body', 'neutral-700', '긴 본문 단락'],
    ['secondary', 'neutral-600', '보조 설명 텍스트'],
    ['subtle', 'neutral-500', '메타 정보 (작성일, 카운트)'],
    ['disabled', 'neutral-400', '비활성 텍스트', undefined, true],
    ['inverse', 'neutral-50', '어두운 배경 위 텍스트', 'neutral-900'],
    ['brand', 'brand-700', '브랜드 강조 텍스트, 링크'],
    ['on-brand', 'neutral-50', '브랜드 배경 위 텍스트', 'brand-700'],
    ['on-action', 'neutral-0', '액션 버튼 라벨', 'brand-700'],
    ['on-image', 'neutral-0', '이미지 오버레이 위 텍스트', 'neutral-900'],
    ['error', 'red-700', '오류 메시지'],
    ['warning', 'amber-800', '주의 메시지'],
    ['success', 'teal-700', '성공 메시지'],
    ['information', 'blue-700', '안내 메시지'],
  ]),
  group('background', 'Background', '면 색상. 표면 위계와 상태 배너에 사용합니다.', 'background', [
    ['default', 'neutral-50', '페이지 기본 배경'],
    ['surface', 'neutral-0', '카드, 시트 표면'],
    ['elevated', 'neutral-50', '떠 있는 표면 (모달, 팝오버)'],
    ['subtle', 'neutral-100', '약한 구분 배경'],
    ['inverse', 'neutral-900', '반전 배경 (토스트)'],
    ['disabled', 'neutral-200', '비활성 컨트롤 배경'],
    ['brand', 'brand-700', '주요 액션 배경'],
    ['brand-accent', 'brand-500', '강조 배경, 활성 상태'],
    ['brand-subtle', 'brand-50', '브랜드 톤 연한 배경'],
    ['error', 'red-50', '오류 배너 배경'],
    ['warning', 'amber-50', '주의 배너 배경'],
    ['success', 'teal-50', '성공 배너 배경'],
    ['information', 'blue-50', '안내 배너 배경'],
    ['image-placeholder', 'neutral-300', '이미지 로딩 자리'],
    ['image-placeholder-warm', 'brand-100', '음식 이미지 자리 (웜톤)'],
    ['transparent', 'alpha-white-0', '투명 배경'],
  ]),
  group('border', 'Border', '테두리와 구분선. 포커스 링은 blue-500로 고정됩니다.', 'border', [
    ['default', 'neutral-200', '기본 구분선, 입력 테두리'],
    ['strong', 'neutral-400', '강조 테두리'],
    ['disabled', 'neutral-200', '비활성 테두리'],
    ['brand', 'brand-500', '브랜드 테두리, 선택 상태'],
    ['focus', 'blue-500', '포커스 링'],
    ['error', 'red-500', '오류 입력 테두리'],
    ['error-subtle', 'red-200', '약한 오류 표시'],
    ['warning', 'amber-500', '주의 테두리'],
    ['success', 'teal-500', '성공 테두리'],
    ['information', 'blue-500', '안내 테두리'],
  ]),
  group('overlay', 'Overlay', '스크림과 오버레이. 모두 반투명이라 아래 색과 합성됩니다.', 'overlay', [
    ['transparent', 'alpha-black-0', '투명 (트랜지션 시작점)'],
    ['dark-subtle', 'alpha-black-13', '아주 약한 딤'],
    ['dark-medium', 'alpha-black-30', '이미지 위 텍스트 가독성 확보'],
    ['dark-50', 'alpha-black-50', '기본 모달 스크림'],
    ['dark-heavy', 'alpha-black-54', '강한 스크림'],
    ['dark-strong', 'alpha-black-72', '전체 화면 딤'],
    ['dark-max', 'alpha-black-95', '거의 불투명한 딤'],
    ['light-subtle', 'alpha-white-6', '어두운 면 위 약한 하이라이트'],
    ['light-medium', 'alpha-white-27', '유리 효과'],
    ['light-strong', 'alpha-white-60', '강한 밝은 오버레이'],
  ]),
  group('shadow', 'Shadow', '그림자 색상. 뉴트럴 블랙이 아닌 웜톤 알파를 사용합니다.', 'background', [
    ['action', 'alpha-shadow-action', '플로팅 액션 버튼 그림자'],
    ['header', 'alpha-shadow-header', '헤더 하단 그림자'],
    ['navigation', 'alpha-shadow-navigation', '하단 내비게이션 그림자'],
    ['search', 'alpha-shadow-search', '검색 바 그림자'],
  ]),
];

/**
 * 외부 브랜드(네이버) 고정색 — design.pen `naver-*` 변수 미러.
 * 지도 목업과 지역 검색 출처 표기 전용이라 시맨틱 스케일·대비 검사 대상에서
 * 제외하고 별도 목록으로 둔다.
 */
export const NAVER_COLORS: { token: string; hex: string; usage: string }[] = [
  { token: 'color-naver-green', hex: '#03c75a', usage: '네이버 로고 N, 지도 핀, 검색 결과 선택 상태' },
  { token: 'color-naver-map-background', hex: '#edf1e9', usage: '지도 목업 바탕' },
  { token: 'color-naver-map-border', hex: '#d9ddd5', usage: '지도 테두리, 지도 컨트롤 보더' },
  { token: 'color-naver-logo-surface', hex: '#ffffff', usage: 'NAVER 지도 브랜딩 배지 바탕' },
  { token: 'color-naver-logo-text', hex: '#333333', usage: 'NAVER 지도 브랜딩 글자, 지도 컨트롤 아이콘' },
];

/** The surface every contrast figure in the catalog is measured against. */
export const CONTRAST_BASE = {
  token: 'color-neutral-50',
  hex: PRIMITIVE_HEX['neutral-50'],
};

export const resolveRef = (ref: string): string => {
  const hex = PRIMITIVE_HEX[ref];
  if (!hex) throw new Error(`Semantic token references unknown primitive: ${ref}`);
  return hex;
};
