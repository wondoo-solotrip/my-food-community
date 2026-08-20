import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { TextField } from './TextField';
import { ICON_NAMES } from './Icon';
import { Matrix, Stack } from './docs/Matrix';
import { FIELD_SIZES, FIELD_SIZE_LABEL, FIELD_STATES, type FieldSize, type FieldState } from './field';

const TYPES = ['text', 'password'] as const;

/** Copy taken from the .pen components so the catalog reads like the design. */
const COPY = {
  text: { label: '맛집 이름', placeholder: '맛집 이름 입력', value: '골목 끝 화덕 생선구이' },
  password: { label: '비밀번호', placeholder: '비밀번호 입력', value: 'letsdingco' },
} as const;

const meta = {
  title: 'Components/Text Field',
  component: TextField,
  tags: ['autodocs'],
  args: {
    label: '맛집 이름',
    placeholder: '맛집 이름 입력',
    helper: '최대 30자까지 입력할 수 있어요.',
    errorMessage: '이름을 입력해 주세요.',
    type: 'text',
    size: 'md',
    state: 'default',
    leadingIcon: 'search',
    trailingIcon: 'close',
  },
  argTypes: {
    type: { control: 'inline-radio', options: TYPES },
    size: { control: 'inline-radio', options: FIELD_SIZES },
    state: { control: 'inline-radio', options: FIELD_STATES },
    leadingIcon: { control: 'select', options: [undefined, ...ICON_NAMES] },
    trailingIcon: { control: 'select', options: [undefined, ...ICON_NAMES] },
  },
  decorators: [
    (Story) => (
      <div className="w-[300px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof TextField>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/**
 * The 24 `.pen` components: 타입(행) × 상태(열), once per size. FOCUSED and ERROR
 * show a filled value because that is what the design file draws — the other two
 * columns show the placeholder.
 */
export const AllVariants: Story = {
  parameters: { controls: { disable: true } },
  decorators: [],
  render: () => (
    <Stack>
      {FIELD_SIZES.map((size) => (
        <Matrix
          key={size}
          caption={FIELD_SIZE_LABEL[size]}
          rows={TYPES}
          columns={FIELD_STATES}
          render={(row, column) => {
            const type = row as (typeof TYPES)[number];
            const state = column as FieldState;
            const copy = COPY[type];
            const filled = state === 'focused' || state === 'error';
            return (
              <div className="w-[260px]">
                <TextField
                  type={type}
                  size={size as FieldSize}
                  state={state}
                  label={copy.label}
                  placeholder={copy.placeholder}
                  defaultValue={filled ? copy.value : undefined}
                  helper="최대 30자까지 입력할 수 있어요."
                  errorMessage="이름을 입력해 주세요."
                  leadingIcon="search"
                  trailingIcon="close"
                />
              </div>
            );
          }}
        />
      ))}
    </Stack>
  ),
};

/**
 * `hideLabel` keeps the label for screen readers but drops the visible row —
 * the main-page search instance in `.pen` disables the label the same way.
 */
export const HiddenLabel: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <TextField
      label="맛집 검색"
      hideLabel
      size="lg"
      leadingIcon="search"
      placeholder="가족 외식, 주차 가능, 조용한 골목"
    />
  ),
};

/**
 * `focusRing={false}` — 포커스해도 파란 테두리 강조가 없다. 메인 검색창처럼
 * 조용히 머물러야 하는 필드가 쓴다.
 */
export const NoFocusRing: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <TextField
      label="맛집 검색"
      hideLabel
      size="lg"
      leadingIcon="search"
      placeholder="가족 외식, 주차 가능, 조용한 골목"
      focusRing={false}
    />
  ),
};

/**
 * `trailingAction` turns the trailing slot into a real button — `.pen`
 * 08 장소 검색의 입력 지우기(X)가 이 형태다. 장식용 `trailingIcon`과 달리
 * 라벨과 클릭 동작을 갖는다.
 */
export const TrailingAction: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <TextField
      label="장소 검색"
      leadingIcon="search"
      defaultValue="서울시청"
      helper="네이버에서 장소명과 주소를 검색합니다."
      trailingAction={{ icon: 'close', label: '검색어 지우기', onClick: () => {} }}
    />
  ),
};

/** Both icon slots are optional, at every size. */
export const IconSlots: Story = {
  parameters: { controls: { disable: true } },
  decorators: [],
  render: () => (
    <Matrix
      rows={['text']}
      hideRowLabels
      columns={['둘 다', '좌측만', '우측만', '없음']}
      render={(_row, column) => (
        <div className="w-[240px]">
          <TextField
            label="맛집 이름"
            placeholder="맛집 이름 입력"
            leadingIcon={column === '둘 다' || column === '좌측만' ? 'search' : undefined}
            trailingIcon={column === '둘 다' || column === '우측만' ? 'close' : undefined}
          />
        </div>
      )}
    />
  ),
};
