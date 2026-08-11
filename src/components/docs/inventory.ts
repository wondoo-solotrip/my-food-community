/**
 * The handoff ledger: what `design.pen` holds, what code it became, and every
 * place the two deliberately differ.
 *
 * Counts are derived from this table rather than written into the prose, so the
 * overview page cannot drift from the inventory the way a hand-typed total would.
 */

export type ComponentGroup = 'action' | 'form' | 'navigation' | 'feedback' | 'etc';

export const GROUP_LABEL: Record<ComponentGroup, string> = {
  action: 'Action',
  form: 'Form',
  navigation: 'Navigation',
  feedback: 'Feedback',
  etc: 'Etc',
};

/** Which guide file specified each group. */
export const GROUP_SOURCE: Record<ComponentGroup, string> = {
  action: '08 · 09',
  form: '10',
  navigation: '11',
  feedback: '12',
  etc: '13',
};

export interface ComponentEntry {
  group: ComponentGroup;
  /** Storybook sidebar name, under `Components/`. */
  name: string;
  /** Naming pattern of the matching `.pen` components. */
  pen: string;
  /** How many `.pen` reusable components this one component replaces. */
  penCount: number;
  /** Exported component names. */
  code: string[];
  /** Props that carry the `.pen` variant axes. */
  axes: string;
}

export const COMPONENTS: ComponentEntry[] = [
  {
    group: 'action',
    name: 'Icon Button',
    pen: 'Icon Button / {Ghost | Brand Circle | Neutral Circle} / 48',
    penCount: 3,
    code: ['IconButton'],
    axes: 'variant × size',
  },
  {
    group: 'action',
    name: 'Button',
    pen: 'Button / {PRIMARY | SECONDARY | DESTRUCTIVE} / {DEFAULT | DISABLED | LOADING} / {SM | MD | LG}',
    penCount: 27,
    code: ['Button'],
    axes: 'variant × size + disabled · loading',
  },
  {
    group: 'form',
    name: 'Text Field',
    pen: 'Text Field / {TEXT | PASSWORD} / {DEFAULT | FOCUSED | DISABLED | ERROR} / {SM | MD | LG}',
    penCount: 24,
    code: ['TextField'],
    axes: 'type × state × size',
  },
  {
    group: 'form',
    name: 'Textarea',
    pen: 'Textarea / {DEFAULT | FOCUSED | DISABLED | ERROR}',
    penCount: 4,
    code: ['Textarea'],
    axes: 'state',
  },
  {
    group: 'form',
    name: 'Checkbox',
    pen: 'Checkbox / {UNCHECKED | CHECKED | INDETERMINATE} / {DEFAULT | DISABLED | ERROR} / {SM | MD}',
    penCount: 18,
    code: ['Checkbox'],
    axes: 'selection × state × size',
  },
  {
    group: 'form',
    name: 'Radio',
    pen: 'Radio / {UNSELECTED | SELECTED} / {DEFAULT | DISABLED} / {SM | MD}',
    penCount: 8,
    code: ['Radio', 'RadioGroup'],
    axes: 'selected × state × size',
  },
  {
    group: 'form',
    name: 'Switch',
    pen: 'Switch / {OFF | ON} / {DEFAULT | DISABLED} / {SM | MD}',
    penCount: 8,
    code: ['Switch'],
    axes: 'checked × state × size',
  },
  {
    group: 'form',
    name: 'Select',
    pen: 'Select / {DEFAULT | FOCUSED | DISABLED | ERROR} / {SM | MD | LG}',
    penCount: 12,
    code: ['Select'],
    axes: 'state × size + open',
  },
  {
    group: 'form',
    name: 'Select Item',
    pen: 'Select Item / {DEFAULT | SELECTED | DISABLED} / {SM | MD | LG}',
    penCount: 9,
    code: ['SelectItem', 'SelectList'],
    axes: 'state × size',
  },
  {
    group: 'form',
    name: 'Chip',
    pen: 'Chip / {UNSELECTED | SELECTED} / {DEFAULT | DISABLED} / {SM | MD}',
    penCount: 8,
    code: ['Chip'],
    axes: 'selected × state × size + leadingIcon',
  },
  {
    group: 'form',
    name: 'File Uploader',
    pen: 'File Uploader / {DEFAULT | DRAGOVER | DISABLED | ERROR}',
    penCount: 4,
    code: ['FileUploader'],
    axes: 'state',
  },
  {
    group: 'form',
    name: 'File Uploader',
    pen: 'File Item / {UPLOADING | COMPLETE | ERROR}',
    penCount: 3,
    code: ['FileItem'],
    axes: 'status',
  },
  {
    group: 'navigation',
    name: 'Top Navigation',
    pen: 'Top Navigation / Default',
    penCount: 1,
    code: ['TopNavigation'],
    axes: 'leading · trailing 슬롯',
  },
  {
    group: 'navigation',
    name: 'Bottom Navigation',
    pen: 'Bottom Navigation / Default',
    penCount: 1,
    code: ['BottomNavigation'],
    axes: 'items × activeIndex × showLabels',
  },
  {
    group: 'navigation',
    name: 'Tab Navigation',
    pen: 'Tab Navigation / Default',
    penCount: 1,
    code: ['TabNavigation'],
    axes: 'tabs × activeIndex',
  },
  {
    group: 'feedback',
    name: 'Spinner',
    pen: 'Spinner / Brand / MD 24',
    penCount: 1,
    code: ['Spinner'],
    axes: 'size × tone',
  },
  {
    group: 'feedback',
    name: 'Skeleton',
    pen: 'Skeleton / {Text | Rectangle | Circle}',
    penCount: 3,
    code: ['Skeleton'],
    axes: 'variant + 대상 요소 치수',
  },
  {
    group: 'feedback',
    name: 'Toast',
    pen: 'Toast / {SUCCESS | ERROR | INFO | WARNING} / {MOBILE | DESKTOP}',
    penCount: 8,
    code: ['Toast'],
    axes: 'type × viewport + onClose',
  },
  {
    group: 'etc',
    name: 'Card',
    pen: 'Card / Default',
    penCount: 1,
    code: ['Card'],
    axes: 'image 슬롯',
  },
  {
    group: 'etc',
    name: 'Badge',
    pen: 'Badge / {NEUTRAL | SUCCESS | ERROR | INFO | WARNING} / {MD | LG}',
    penCount: 10,
    code: ['Badge'],
    axes: 'type × size',
  },
  {
    group: 'etc',
    name: 'Empty State',
    pen: 'Empty State / Default',
    penCount: 1,
    code: ['EmptyState'],
    axes: 'visual · description · action 슬롯',
  },
  {
    group: 'etc',
    name: 'Modal',
    pen: 'Modal / Default',
    penCount: 1,
    code: ['Modal'],
    axes: 'action 슬롯 + position',
  },
  {
    group: 'etc',
    name: 'Bottom Sheet',
    pen: 'Bottom Sheet / Default',
    penCount: 1,
    code: ['BottomSheet'],
    axes: 'title · description · children + position',
  },
  {
    group: 'etc',
    name: 'Menu',
    pen: 'Menu / Default',
    penCount: 1,
    code: ['Menu'],
    axes: 'children',
  },
  {
    group: 'etc',
    name: 'Menu Item',
    pen: 'Menu Item / {DEFAULT | DESTRUCTIVE} / {DEFAULT | DISABLED} / {SM | MD | LG}',
    penCount: 12,
    code: ['MenuItem'],
    axes: 'type × state × size + leadingIcon',
  },
];

/** `.pen` reusable components that are *not* UI components. */
export const NON_UI_PEN_COMPONENTS = [
  { label: 'Icon / {name} / {16 | 20 | 24 | 32}', count: 144, note: 'Iconography 파운데이션' },
  { label: 'Typography / {스타일}', count: 10, note: 'Typography 파운데이션' },
  { label: 'Documentation / …', count: 2, note: '문서용 텍스트 스타일' },
];

export const UI_PEN_COUNT = COMPONENTS.reduce((sum, c) => sum + c.penCount, 0);
export const NON_UI_PEN_COUNT = NON_UI_PEN_COMPONENTS.reduce((sum, c) => sum + c.count, 0);
export const TOTAL_PEN_COUNT = UI_PEN_COUNT + NON_UI_PEN_COUNT;
export const CODE_COMPONENT_COUNT = new Set(COMPONENTS.flatMap((c) => c.code)).size;
export const FAMILY_COUNT = new Set(COMPONENTS.map((c) => c.name)).size;

/* -- differences ----------------------------------------------------------- */

export interface Deviation {
  where: string;
  /** What the design file or the guide says. */
  design: string;
  /** What the code does. */
  code: string;
  why: string;
}

/**
 * Every knowing departure from `design.pen` or from the guide text. Listed rather
 * than silently reconciled — a handoff that hides these makes the next designer
 * wonder why the numbers do not match.
 */
export const DEVIATIONS: Deviation[] = [
  {
    where: 'Button 좌우 패딩',
    design: '고정 폭 120 / 136 / 152, 패딩 속성 없음 (실측 14 / 16 / 24)',
    code: '패딩 12 / 16 / 24',
    why: '아이콘 개수에 따라 폭이 변해야 하므로 패딩 모델로 전환. sm의 14px는 스페이싱 스케일(8·12·16·20·24·32)에 없어 12px로 정규화.',
  },
  {
    where: 'Button LOADING 스피너',
    design: 'refresh 글리프를 45° 회전한 정지 이미지',
    code: '동일 글리프를 회전 애니메이션',
    why: '캔버스는 애니메이션을 표현할 수 없어 정지 프레임으로 대신한 것. 코드에서는 의도한 동작을 그대로 구현.',
  },
  {
    where: 'Bottom Sheet 드래그 핸들',
    design: '원시 hex `#000000`',
    code: '`color-background-inverse`',
    why: '가이드의 "컬러는 시맨틱 토큰에서 선택" 규칙 위반. 가장 가까운 시맨틱 토큰으로 대체.',
  },
  {
    where: 'Menu 그림자',
    design: '원시 hex `#0000001A`',
    code: '`color-shadow-navigation`',
    why: '동일 사유. 떠 있는 내비게이션 성격 표면에 대응하는 시맨틱 그림자 토큰으로 대체.',
  },
  {
    where: 'Bottom Navigation 선택 아이콘',
    design: '가이드는 "타입: 필(filled)" 요구, 아이콘 세트에는 아웃라인 글리프만 존재',
    code: '아웃라인 글리프 + 브랜드 색',
    why: '채워진 글리프가 아이코노그래피 파운데이션에 없음. 선택 표현이 색상에만 의존하므로, 레이블 색까지 함께 변해 색맹 사용자도 구분할 수 있게 유지.',
  },
  {
    where: 'Bottom Navigation 선택 아이콘 토큰',
    design: '아이콘 fill에 `color-background-brand` 사용',
    code: '`color-text-brand`',
    why: '아이콘은 텍스트 계열 토큰을 써야 함. 두 토큰 모두 `brand-700`으로 해석되어 색은 동일.',
  },
  {
    where: 'Badge NEUTRAL 테두리',
    design: 'stroke에 배경 토큰 `color-background-inverse` 사용',
    code: '동일하게 유지',
    why: '채움과 같은 색이라 시각적으로 무테. 임의로 바꾸면 20 / 24px 높이가 달라져 설계와 어긋남.',
  },
  {
    where: 'Modal 제목 크기',
    design: '가이드 표기 `heading-so`',
    code: '`heading-sm`',
    why: '`heading-so`는 타이포그래피 스케일에 없는 오타. `.pen`도 `heading-sm`을 사용.',
  },
  {
    where: '스페이싱 스케일 외 값',
    design: '4 · 5 · 6 · 10 · 14 · 18px가 `.pen`에 등장',
    code: '실측값 유지 (Button 패딩만 예외)',
    why: '스페이싱 토큰은 8·12·16·20·24·32뿐. 임의 정규화는 시각을 바꾸므로, 눈에 보이는 간격은 설계값을 그대로 따르고 이 표로 드러냄.',
  },
];

export interface Addition {
  what: string;
  why: string;
}

/** Behaviour a static canvas cannot express, added at the code layer. */
export const ADDITIONS: Addition[] = [
  {
    what: 'focus-visible 링 — `outline` 2px `color-border-focus`',
    why: '`.pen`에는 Text Field FOCUSED 외에 포커스 상태가 없음. 키보드 사용자에게 필수이고, 토큰은 이미 디자인 시스템이 보유.',
  },
  {
    what: 'ARIA 역할·상태 — `role=checkbox·radio·switch·combobox·option·menuitem·tab`, `aria-checked·pressed·expanded·busy·invalid`',
    why: '설계상의 선택·열림·오류 상태를 보조기술에 전달. 시각 표현은 바뀌지 않음.',
  },
  {
    what: 'loading 중 클릭 차단',
    why: '`disabled` 속성만 부여하고 색은 `.pen`의 활성 상태를 유지 — 중복 제출을 막되 디자인은 그대로.',
  },
  {
    what: '실제 포커스 반응 (`focus-within`)',
    why: 'DEFAULT 상태의 필드는 실제로 포커스되면 FOCUSED 프레임과 같은 2px 파란 테두리가 됨.',
  },
  {
    what: 'Modal · BottomSheet `position` prop',
    why: '`.pen`은 360×320 폰 프레임 안에 스크림을 그림. `absolute`로 그 프레임을 재현하고, `fixed`로 실제 앱에서 사용.',
  },
];

/** Asked for by the guide but intentionally not built. */
export const OMISSIONS: Addition[] = [
  {
    what: 'Icon Button disabled 상태',
    why: '가이드가 "이미 완료된 상태이므로 수정 금지"로 못 박고 종류를 배경 3종으로만 정의. 네 번째 상태를 만들면 설계와 어긋나므로 추가하지 않음.',
  },
];
