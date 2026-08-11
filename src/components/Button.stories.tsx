import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { Button, type ButtonSize, type ButtonVariant } from './Button';
import { ICON_NAMES } from './Icon';
import { Matrix, Stack } from './docs/Matrix';

const VARIANTS: ButtonVariant[] = ['primary', 'secondary', 'destructive'];
const STATES = ['default', 'disabled', 'loading'] as const;
const SIZES: { size: ButtonSize; label: string }[] = [
  { size: 'sm', label: 'sm (32)' },
  { size: 'md', label: 'md (40)' },
  { size: 'lg', label: 'lg (48)' },
];

/** Label copy the .pen components use for each variant. */
const LABEL: Record<ButtonVariant, string> = {
  primary: '계속하기',
  secondary: '취소',
  destructive: '삭제',
};

const meta = {
  title: 'Components/Button',
  component: Button,
  tags: ['autodocs'],
  args: {
    variant: 'primary',
    size: 'md',
    children: '계속하기',
    leadingIcon: 'plus',
    trailingIcon: 'arrow-right',
  },
  argTypes: {
    variant: { control: 'inline-radio', options: VARIANTS },
    size: { control: 'inline-radio', options: SIZES.map((s) => s.size) },
    leadingIcon: { control: 'select', options: [undefined, ...ICON_NAMES] },
    trailingIcon: { control: 'select', options: [undefined, ...ICON_NAMES] },
  },
} satisfies Meta<typeof Button>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/**
 * The handoff view: the 27 `.pen` components as 3 grids of 타입(행) × 상태(열).
 * Every cell here is the single `Button` component with different props.
 */
export const AllVariants: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Stack>
      {SIZES.map(({ size, label }) => (
        <Matrix
          key={size}
          caption={label}
          rows={VARIANTS}
          columns={STATES}
          render={(row, column) => {
            const variant = row as ButtonVariant;
            return (
              <Button
                variant={variant}
                size={size}
                disabled={column === 'disabled'}
                loading={column === 'loading'}
                leadingIcon="plus"
                trailingIcon="arrow-right"
              >
                {LABEL[variant]}
              </Button>
            );
          }}
        />
      ))}
    </Stack>
  ),
};

/** Both icon slots are optional; the label is the only required part. */
export const IconSlots: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Matrix
      rows={['primary', 'secondary']}
      columns={['둘 다', '좌측만', '우측만', '없음']}
      render={(row, column) => {
        const variant = row as ButtonVariant;
        const leading = column === '둘 다' || column === '좌측만' ? 'plus' : undefined;
        const trailing = column === '둘 다' || column === '우측만' ? 'arrow-right' : undefined;
        return (
          <Button variant={variant} leadingIcon={leading} trailingIcon={trailing}>
            {LABEL[variant]}
          </Button>
        );
      }}
    />
  ),
};

/**
 * `loading` swaps the leading slot for a spinner and keeps the label, per the
 * guide. It also sets `aria-busy` and blocks a second click, which the static
 * design frame cannot express.
 */
export const Loading: Story = {
  args: { loading: true },
};
