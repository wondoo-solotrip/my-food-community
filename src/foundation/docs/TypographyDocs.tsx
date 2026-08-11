/**
 * Documentation-only renderers for the typography foundation.
 *
 * Specimens are rendered with the real `type-*` utility classes rather than
 * inline styles, so the page fails visibly if the Tailwind layer regresses.
 */
import {
  FONT_FAMILY,
  FONT_SIZES,
  FONT_WEIGHTS,
  LETTER_SPACING,
  LINE_HEIGHTS,
  TYPE_STYLES,
  type PrimitiveEntry,
} from '../typography';
import { code, mono, table, td, th } from './table';

/**
 * Utility class names written out as literals — Tailwind v4 scans source text
 * statically, so a computed `` `type-${name}` `` would never be generated.
 */
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

/* -- specimens ------------------------------------------------------------ */

export function TypeScale() {
  return (
    // `sb-unstyled` opts out of Storybook's docs typography. Those rules are
    // unlayered, so they beat Tailwind's `@layer utilities` no matter how
    // specific `type-*` is, and specimens would render at the docs' own size.
    <div className="sb-unstyled" style={{ margin: '0 0 40px' }}>
      {TYPE_STYLES.map((s) => (
        <div
          key={s.name}
          style={{
            display: 'flex',
            alignItems: 'baseline',
            gap: 24,
            padding: '18px 0',
            borderBottom: '1px solid var(--color-border-default)',
          }}
        >
          <div style={{ flex: '1 1 auto', minWidth: 0 }}>
            <p className={UTILITY_CLASS[s.name]} style={{ margin: 0, color: 'var(--color-text-default)' }}>
              {s.sample}
            </p>
          </div>

          <div style={{ flex: '0 0 232px', fontSize: 12, lineHeight: 1.6 }}>
            <div style={{ fontFamily: mono, fontWeight: 600, marginBottom: 4 }}>.{s.utility}</div>
            <div style={{ color: 'var(--color-text-subtle)', fontFamily: mono }}>
              {s.sizeToken.replace('font-size-', 'size ')} · {s.sizePx}px
              <br />
              {s.weightToken.replace('font-weight-', 'weight ')} · {s.weight}
              <br />
              {s.lineHeightToken.replace('font-line-height-', 'leading ')} · {s.lineHeight}
              <br />
              tracking -2% · {s.letterSpacingPx}px
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* -- primitive tables ----------------------------------------------------- */

function PrimitiveTable({ rows, valueHeader }: { rows: PrimitiveEntry[]; valueHeader: string }) {
  return (
    <table style={table}>
      <thead>
        <tr>
          <th style={th}>토큰</th>
          <th style={th}>{valueHeader}</th>
          <th style={th}>비고</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.token}>
            <td style={td}>
              <code style={code}>{r.token}</code>
            </td>
            <td style={td}>
              <code style={{ ...code, color: 'var(--color-text-secondary)' }}>{r.value}</code>
            </td>
            <td style={{ ...td, color: 'var(--color-text-subtle)' }}>{r.note ?? '—'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export const FontSizeTable = () => <PrimitiveTable rows={FONT_SIZES} valueHeader="크기" />;
export const FontWeightTable = () => <PrimitiveTable rows={FONT_WEIGHTS} valueHeader="두께" />;
export const LineHeightTable = () => <PrimitiveTable rows={LINE_HEIGHTS} valueHeader="배수" />;
export const LetterSpacingTable = () => (
  <PrimitiveTable rows={[LETTER_SPACING]} valueHeader="자간" />
);

/* -- font family ---------------------------------------------------------- */

export function FontFamilyCard() {
  return (
    <div
      className="sb-unstyled"
      style={{
        border: '1px solid var(--color-border-default)',
        borderRadius: 8,
        padding: 20,
        margin: '0 0 40px',
        background: 'var(--color-background-surface)',
      }}
    >
      <p className="type-display-sm" style={{ margin: '0 0 4px' }}>
        {FONT_FAMILY.value}
      </p>
      <p style={{ margin: '0 0 16px', fontSize: 12, color: 'var(--color-text-subtle)', fontFamily: mono }}>
        {FONT_FAMILY.token} · {FONT_FAMILY.file} · weight {FONT_FAMILY.weightRange}
      </p>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 28 }}>
        {FONT_WEIGHTS.map((w) => (
          <div key={w.token}>
            <div
              style={{
                fontSize: 28,
                lineHeight: 1.2,
                letterSpacing: '-0.02em',
                fontWeight: Number(w.value),
                fontFamily: 'var(--font-family)',
              }}
            >
              가나다 Aa 123
            </div>
            <div style={{ fontSize: 11, color: 'var(--color-text-subtle)', fontFamily: mono, marginTop: 2 }}>
              {w.token.replace('font-weight-', '')} · {w.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* -- tracking verification ------------------------------------------------ */

/** Shows that every style's stored px tracking really is its size × -2%. */
export function TrackingCheck() {
  return (
    <table style={table}>
      <thead>
        <tr>
          <th style={th}>스타일</th>
          <th style={th}>크기</th>
          <th style={th}>크기 × -2%</th>
          <th style={th}>.pen 저장값</th>
          <th style={th}>일치</th>
        </tr>
      </thead>
      <tbody>
        {TYPE_STYLES.map((s) => {
          const expected = Math.round(s.sizePx * -0.02 * 100) / 100;
          const match = expected === s.letterSpacingPx;
          return (
            <tr key={s.name}>
              <td style={td}>
                <code style={code}>{s.name}</code>
              </td>
              <td style={td}>{s.sizePx}px</td>
              <td style={td}>{expected}px</td>
              <td style={td}>{s.letterSpacingPx}px</td>
              <td style={{ ...td, color: match ? 'var(--color-text-success)' : 'var(--color-text-error)' }}>
                {match ? '일치' : '불일치'}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
