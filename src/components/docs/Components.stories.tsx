/**
 * Regression guards for the UI component handoff. These are tests, not catalog
 * pages — the catalog lives in each component's own `AllVariants` story.
 *
 * They cover the two ways this handoff can silently produce wrong output:
 *   1. geometry drift — a size map edited so a button is no longer 32/40/48 tall,
 *      or a padding that stops matching the value derived from the .pen frames;
 *   2. token drift — a variant pointing at a semantic token that no longer
 *      resolves to the primitive the design file bound it to.
 *
 * Both are invisible in a screenshot review, which is exactly why they are here.
 */
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect } from 'storybook/test';

import { Button, type ButtonSize, type ButtonVariant } from '../Button';
import { Icon } from '../Icon';
import { Switch, type SwitchSize } from '../Switch';
import { TextField } from '../TextField';
import { ICON_VIEW_BOX } from '../../foundation/icons';
import { type FieldSize, type FieldState } from '../field';

/** `rgb(…)` / `rgba(…)` → `#rrggbb`, or `transparent` when fully clear. */
function hex(colour: string): string {
  const parts = colour.match(/[\d.]+/g)?.map(Number) ?? [];
  if (parts.length === 4 && parts[3] === 0) return 'transparent';
  return `#${parts
    .slice(0, 3)
    .map((n) => n.toString(16).padStart(2, '0'))
    .join('')}`;
}

const px = (value: string) => Number.parseFloat(value);

const meta = {
  title: 'Components/Tests',
  parameters: {
    // Tests, not documentation.
    docs: { disable: true },
    controls: { disable: true },
  },
} satisfies Meta;

export default meta;

type Story = StoryObj;

/* -- button ---------------------------------------------------------------- */

const BUTTON_SIZES: { size: ButtonSize; height: number; padding: number; gap: number }[] = [
  { size: 'sm', height: 32, padding: 12, gap: 6 },
  { size: 'md', height: 40, padding: 16, gap: 8 },
  { size: 'lg', height: 48, padding: 24, gap: 8 },
];

/** Resolved primitives each variant's tokens must land on, per design.pen. */
const BUTTON_COLOURS: Record<ButtonVariant, { bg: string; fg: string; border: string }> = {
  primary: { bg: '#b52d0d', fg: '#fffdf9', border: 'transparent' },
  secondary: { bg: '#ffffff', fg: '#1f1a17', border: '#aaa19a' },
  destructive: { bg: '#ffffff', fg: '#a52c18', border: '#e14d2a' },
};

const DISABLED_COLOURS = { bg: '#e9e2da', fg: '#aaa19a', border: '#e9e2da' };

export const ButtonGeometry: Story = {
  render: () => (
    <div className="flex flex-col gap-2">
      {BUTTON_SIZES.map(({ size }) =>
        (Object.keys(BUTTON_COLOURS) as ButtonVariant[]).map((variant) => (
          <Button
            key={`${size}-${variant}`}
            data-testid={`btn-${size}-${variant}`}
            variant={variant}
            size={size}
            leadingIcon="plus"
            trailingIcon="arrow-right"
          >
            계속하기
          </Button>
        )),
      )}
      <Button data-testid="btn-disabled" disabled leadingIcon="plus">
        계속하기
      </Button>
    </div>
  ),
  play: async ({ canvasElement }) => {
    for (const { size, height, padding, gap } of BUTTON_SIZES) {
      for (const variant of Object.keys(BUTTON_COLOURS) as ButtonVariant[]) {
        const el = canvasElement.querySelector<HTMLElement>(
          `[data-testid="btn-${size}-${variant}"]`,
        );
        expect(el, `${size}/${variant} rendered`).toBeTruthy();
        const s = getComputedStyle(el!);

        expect(px(s.height), `${size} height`).toBe(height);
        expect(px(s.paddingLeft), `${size} padding-left`).toBe(padding);
        expect(px(s.paddingRight), `${size} padding-right`).toBe(padding);
        expect(px(s.columnGap), `${size} gap`).toBe(gap);

        // label-lg: 14px / 600. Guards the `type-*` utility against the
        // unlayered docs typography that outranks it on a Docs page.
        expect(px(s.fontSize), `${size} font-size`).toBe(14);
        expect(s.fontWeight, `${size} font-weight`).toBe('600');
        expect(s.fontFamily, `${size} font-family`).toContain('Pretendard Variable');

        const expected = BUTTON_COLOURS[variant];
        expect(hex(s.backgroundColor), `${variant} background`).toBe(expected.bg);
        expect(hex(s.color), `${variant} text`).toBe(expected.fg);
        expect(hex(s.borderTopColor), `${variant} border`).toBe(expected.border);
      }
    }

    const disabled = canvasElement.querySelector<HTMLElement>('[data-testid="btn-disabled"]');
    const ds = getComputedStyle(disabled!);
    expect(hex(ds.backgroundColor), 'disabled background').toBe(DISABLED_COLOURS.bg);
    expect(hex(ds.color), 'disabled text').toBe(DISABLED_COLOURS.fg);
    expect(hex(ds.borderTopColor), 'disabled border').toBe(DISABLED_COLOURS.border);
    expect(disabled!.hasAttribute('disabled'), 'disabled attribute').toBe(true);
  },
};

/* -- fields --------------------------------------------------------------- */

/** FOCUSED is the only 2px border; the four colours come from design.pen. */
const FIELD_BORDER: Record<FieldState, { width: number; colour: string }> = {
  default: { width: 1, colour: '#e9e2da' },
  focused: { width: 2, colour: '#3b82f6' },
  disabled: { width: 1, colour: '#e9e2da' },
  error: { width: 1, colour: '#e14d2a' },
};

const FIELD_HEIGHTS: Record<FieldSize, number> = { sm: 32, md: 40, lg: 48 };

export const TextFieldBox: Story = {
  render: () => (
    <div className="flex w-[300px] flex-col gap-3">
      {(Object.keys(FIELD_BORDER) as FieldState[]).map((state) => (
        <div key={state} data-testid={`field-${state}`}>
          <TextField label="맛집 이름" state={state} placeholder="맛집 이름 입력" />
        </div>
      ))}
      {(Object.keys(FIELD_HEIGHTS) as FieldSize[]).map((size) => (
        <div key={size} data-testid={`field-size-${size}`}>
          <TextField label="맛집 이름" size={size} placeholder="맛집 이름 입력" />
        </div>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    // The bordered box is the input's parent, not the input itself.
    const boxOf = (testId: string) => {
      const input = canvasElement.querySelector<HTMLElement>(
        `[data-testid="${testId}"] input`,
      );
      expect(input, `${testId} input rendered`).toBeTruthy();
      return input!.parentElement!;
    };

    for (const [state, expected] of Object.entries(FIELD_BORDER) as [
      FieldState,
      { width: number; colour: string },
    ][]) {
      const s = getComputedStyle(boxOf(`field-${state}`));
      expect(px(s.borderTopWidth), `${state} border width`).toBe(expected.width);
      expect(hex(s.borderTopColor), `${state} border colour`).toBe(expected.colour);
      // 12px corner radius is shared by every bordered field in the design.
      expect(px(s.borderTopLeftRadius), `${state} radius`).toBe(12);
    }

    for (const [size, height] of Object.entries(FIELD_HEIGHTS) as [FieldSize, number][]) {
      const s = getComputedStyle(boxOf(`field-size-${size}`));
      expect(px(s.height), `${size} height`).toBe(height);
    }

    // Disabled must reach the control, not just its wrapper's colours.
    const disabledInput = canvasElement.querySelector<HTMLInputElement>(
      '[data-testid="field-disabled"] input',
    );
    expect(disabledInput!.disabled, 'disabled input').toBe(true);
  },
};

/* -- switch --------------------------------------------------------------- */

/**
 * Thumb offsets straight from the design file: inset 2px when off, and
 * `track − thumb − 2` when on (sm 18, md 22).
 *
 * Measured as a real distance rather than by reading a `transform` or `translate`
 * value, so the assertion holds whichever CSS property the utility happens to use.
 */
const SWITCH: Record<SwitchSize, { track: [number, number]; thumb: number; onOffset: number }> = {
  sm: { track: [32, 16], thumb: 12, onOffset: 18 },
  md: { track: [40, 20], thumb: 16, onOffset: 22 },
};

const THUMB_INSET = 2;

export const SwitchGeometry: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      {(Object.keys(SWITCH) as SwitchSize[]).map((size) =>
        [false, true].map((checked) => (
          <div key={`${size}-${checked}`} data-testid={`switch-${size}-${checked ? 'on' : 'off'}`}>
            <Switch label="추천 알림 사용" size={size} checked={checked} />
          </div>
        )),
      )}
    </div>
  ),
  play: async ({ canvasElement }) => {
    for (const [size, spec] of Object.entries(SWITCH) as [
      SwitchSize,
      (typeof SWITCH)[SwitchSize],
    ][]) {
      for (const state of ['off', 'on'] as const) {
        const wrapper = canvasElement.querySelector<HTMLElement>(
          `[data-testid="switch-${size}-${state}"]`,
        );
        const track = wrapper!.querySelector('button > span')!;
        const thumb = track.firstElementChild!;

        const ts = getComputedStyle(track);
        expect(px(ts.width), `${size} track width`).toBe(spec.track[0]);
        expect(px(ts.height), `${size} track height`).toBe(spec.track[1]);

        expect(px(getComputedStyle(thumb).width), `${size} thumb size`).toBe(spec.thumb);

        const offset =
          thumb.getBoundingClientRect().left - track.getBoundingClientRect().left;
        expect(offset, `${size}/${state} thumb offset`).toBeCloseTo(
          state === 'on' ? spec.onOffset : THUMB_INSET,
          1,
        );
      }
    }
  },
};

/* -- icon ----------------------------------------------------------------- */

export const IconRendering: Story = {
  render: () => (
    <div className="flex items-end gap-2 text-text-brand">
      {[16, 20, 24, 32].map((size) => (
        <Icon key={size} name="heart" size={size} title={`heart ${size}`} />
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const svgs = canvasElement.querySelectorAll('svg');
    expect(svgs.length, 'four sizes rendered').toBe(4);

    svgs.forEach((svg, index) => {
      const size = [16, 20, 24, 32][index];
      // All four sizes share one path because they share one coordinate system.
      expect(svg.getAttribute('viewBox'), `${size} viewBox`).toBe(ICON_VIEW_BOX);
      expect(px(getComputedStyle(svg).width), `${size} width`).toBe(size);
      expect(svg.querySelector('path')?.getAttribute('fill'), `${size} fill`).toBe('currentColor');
    });

    // `currentColor` must resolve through the container's semantic token.
    expect(hex(getComputedStyle(svgs[0]).color), 'inherited brand colour').toBe('#b52d0d');
  },
};
