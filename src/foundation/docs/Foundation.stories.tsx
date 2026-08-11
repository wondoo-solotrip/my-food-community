/**
 * Regression guards for the foundation handoff. These are tests, not catalog
 * pages — the catalog lives in the `*.mdx` files.
 *
 * They cover the two ways this handoff can silently produce wrong output:
 *   1. a `type-*` utility whose tokens stop resolving, so text renders at some
 *      inherited size instead of the design size;
 *   2. drift between `globals.css` and the token data modules, which would make
 *      the catalog document values the CSS no longer has.
 */
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect } from 'storybook/test';

import { ALPHA_SCALES, PRIMITIVE_SCALES, SEMANTIC_GROUPS } from '../colors';
import { parseHex } from '../contrast';
import { TYPE_STYLES } from '../typography';

/** Same literal-class map as the catalog: Tailwind cannot see computed names. */
const UTILITY_CLASS: Record<string, string> = {
  'display-lg': 'type-display-lg',
  'display-md': 'type-display-md',
  'display-sm': 'type-display-sm',
  'heading-lg': 'type-heading-lg',
  'heading-md': 'type-heading-md',
  'heading-sm': 'type-heading-sm',
  'body-lg': 'type-body-lg',
  'body-md': 'type-body-md',
  'label-lg': 'type-label-lg',
  'label-md': 'type-label-md',
};

const ALL_SCALES = [...PRIMITIVE_SCALES, ...ALPHA_SCALES];

function Specimens() {
  return (
    <div className="sb-unstyled">
      {TYPE_STYLES.map((s) => (
        <p key={s.name} className={UTILITY_CLASS[s.name]} data-testid={`type-${s.name}`}>
          {s.sample}
        </p>
      ))}
    </div>
  );
}

function Swatches() {
  return (
    <div>
      {ALL_SCALES.flatMap((scale) =>
        scale.steps.map((step) => (
          <span
            key={step.token}
            data-testid={step.token}
            style={{ color: `var(--${step.token})` }}
          />
        )),
      )}
      {SEMANTIC_GROUPS.flatMap((g) =>
        g.tokens.map((t) => (
          <span key={t.token} data-testid={t.token} style={{ color: `var(--${t.token})` }} />
        )),
      )}
    </div>
  );
}

const meta = {
  title: 'Foundation/Tests',
  parameters: {
    // These stories assert computed styles; the docs page carries the prose.
    docs: { disable: true },
  },
} satisfies Meta;

export default meta;

/** Every type style resolves to the size, weight, leading and tracking it documents. */
export const TypeStyles: StoryObj<typeof meta> = {
  render: () => <Specimens />,
  play: async ({ canvas }) => {
    for (const s of TYPE_STYLES) {
      const el = canvas.getByTestId(`type-${s.name}`);
      const cs = getComputedStyle(el);

      expect(cs.fontFamily, `${s.name} font-family`).toContain('Pretendard Variable');
      expect(parseFloat(cs.fontSize), `${s.name} font-size`).toBeCloseTo(s.sizePx, 2);
      expect(cs.fontWeight, `${s.name} font-weight`).toBe(String(s.weight));
      // line-height computes to px; the token is a unitless multiplier.
      expect(parseFloat(cs.lineHeight), `${s.name} line-height`).toBeCloseTo(
        s.sizePx * s.lineHeight,
        1,
      );
      // -2% of the font size, which is what the .pen stores per text node.
      expect(parseFloat(cs.letterSpacing), `${s.name} letter-spacing`).toBeCloseTo(
        s.letterSpacingPx,
        2,
      );
    }
  },
};

const rgba = (value: string) => {
  const nums = value.match(/[\d.]+/g);
  if (!nums) throw new Error(`Unparseable computed colour: ${value}`);
  const [r, g, b, a = '1'] = nums;
  return { r: +r, g: +g, b: +b, a: +a };
};

/**
 * Guards the catalog's central claim: swatches are painted from CSS variables
 * while captions print hex from the token modules, so the two must agree.
 */
export const ColorTokens: StoryObj<typeof meta> = {
  render: () => <Swatches />,
  play: async ({ canvas }) => {
    // Primitives: the CSS variable must equal the hex this repo documents.
    for (const scale of ALL_SCALES) {
      for (const step of scale.steps) {
        const actual = rgba(getComputedStyle(canvas.getByTestId(step.token)).color);
        const expected = parseHex(step.hex);

        expect(actual.a, `${step.token} alpha`).toBeCloseTo(expected.a, 1);

        // Fully transparent colours normalise to rgba(0, 0, 0, 0) in the
        // browser, discarding the authored channels — alpha is all that is left
        // to compare.
        if (expected.a === 0) continue;

        expect(actual.r, `${step.token} red`).toBeCloseTo(expected.r, 0);
        expect(actual.g, `${step.token} green`).toBeCloseTo(expected.g, 0);
        expect(actual.b, `${step.token} blue`).toBeCloseTo(expected.b, 0);
      }
    }

    // Semantics: each must resolve to exactly the primitive it claims to
    // reference — catching a semantic token repointed in CSS but not in data.
    for (const group of SEMANTIC_GROUPS) {
      for (const token of group.tokens) {
        const semantic = getComputedStyle(canvas.getByTestId(token.token)).color;
        const primitive = getComputedStyle(canvas.getByTestId(`color-${token.ref}`)).color;

        expect(semantic, `${token.token} should resolve to color-${token.ref}`).toBe(primitive);
      }
    }
  },
};
