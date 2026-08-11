/**
 * Documentation-only renderers for the token overview page.
 *
 * Inventory counts are derived from the token modules rather than written by
 * hand, so the page cannot claim a total the data does not back up.
 */
import { ALPHA_SCALES, PRIMITIVE_SCALES, SEMANTIC_GROUPS } from '../colors';
import { ICONS, ICON_SIZES } from '../icons';
import { SPACING_TOKENS } from '../spacing';
import { FONT_SIZES, FONT_WEIGHTS, LINE_HEIGHTS, TYPE_STYLES } from '../typography';
import { code, mono, table, td, th } from './table';

/* -- inventory ------------------------------------------------------------ */

const primitiveColorCount = PRIMITIVE_SCALES.reduce((n, s) => n + s.steps.length, 0);
const alphaColorCount = ALPHA_SCALES.reduce((n, s) => n + s.steps.length, 0);
const semanticColorCount = SEMANTIC_GROUPS.reduce((n, g) => n + g.tokens.length, 0);

interface InventoryRow {
  layer: '프리미티브' | '시맨틱' | '합성';
  group: string;
  pattern: string;
  count: number;
  where: string;
}

const ROWS: InventoryRow[] = [
  {
    layer: '프리미티브',
    group: '컬러 램프 (6계열)',
    pattern: 'color-{brand,neutral,red,amber,teal,blue}-*',
    count: primitiveColorCount,
    where: '@theme static',
  },
  {
    layer: '프리미티브',
    group: '알파 컬러',
    pattern: 'color-alpha-*',
    count: alphaColorCount,
    where: '@theme static',
  },
  {
    layer: '시맨틱',
    group: '컬러 (text·background·border·overlay·shadow)',
    pattern: 'color-{text,background,border,overlay,shadow}-*',
    count: semanticColorCount,
    where: '@theme static',
  },
  {
    layer: '프리미티브',
    group: '폰트 크기',
    pattern: 'font-size-100 … 900',
    count: FONT_SIZES.length,
    where: ':root',
  },
  {
    layer: '프리미티브',
    group: '폰트 두께',
    pattern: 'font-weight-*',
    count: FONT_WEIGHTS.length,
    where: ':root',
  },
  {
    layer: '프리미티브',
    group: '행간',
    pattern: 'font-line-height-*',
    count: LINE_HEIGHTS.length,
    where: ':root',
  },
  {
    layer: '프리미티브',
    group: '스페이싱',
    pattern: 'spacing-*',
    count: SPACING_TOKENS.length,
    where: ':root',
  },
  {
    layer: '합성',
    group: '타입 스타일',
    pattern: 'type-{display,heading,body,label}-*',
    count: TYPE_STYLES.length,
    where: '@utility',
  },
  {
    layer: '합성',
    group: '아이콘 (36종 × 4크기)',
    pattern: 'ICONS[].path',
    count: ICONS.length * ICON_SIZES.length,
    where: 'icons.ts',
  },
];

export function TokenInventory() {
  const total = ROWS.reduce((n, r) => n + r.count, 0);

  return (
    <table style={table}>
      <thead>
        <tr>
          <th style={th}>계층</th>
          <th style={th}>그룹</th>
          <th style={th}>이름 규칙</th>
          <th style={{ ...th, textAlign: 'right' }}>개수</th>
          <th style={th}>정의 위치</th>
        </tr>
      </thead>
      <tbody>
        {ROWS.map((r) => (
          <tr key={r.group}>
            <td style={td}>{r.layer}</td>
            <td style={td}>{r.group}</td>
            <td style={td}>
              <code style={{ ...code, color: 'var(--color-text-secondary)' }}>{r.pattern}</code>
            </td>
            <td style={{ ...td, textAlign: 'right', fontFamily: mono }}>{r.count}</td>
            <td style={td}>
              <code style={{ ...code, color: 'var(--color-text-subtle)' }}>{r.where}</code>
            </td>
          </tr>
        ))}
        <tr>
          <td style={{ ...td, fontWeight: 600 }} colSpan={3}>
            합계
          </td>
          <td style={{ ...td, textAlign: 'right', fontFamily: mono, fontWeight: 600 }}>{total}</td>
          <td style={td} />
        </tr>
      </tbody>
    </table>
  );
}

/* -- spacing -------------------------------------------------------------- */

export function SpacingScale() {
  return (
    <table style={table}>
      <thead>
        <tr>
          <th style={th}>토큰</th>
          <th style={th}>값</th>
          <th style={th}>크기</th>
          <th style={th}>Tailwind 등가</th>
          <th style={th}>용도</th>
        </tr>
      </thead>
      <tbody>
        {SPACING_TOKENS.map((s) => (
          <tr key={s.token}>
            <td style={td}>
              <code style={code}>{s.token}</code>
            </td>
            <td style={td}>
              <code style={{ ...code, color: 'var(--color-text-secondary)' }}>{s.px}px</code>
            </td>
            <td style={{ ...td, width: 120 }}>
              <div
                style={{
                  width: `var(--${s.token})`,
                  height: 16,
                  borderRadius: 3,
                  background: 'var(--color-background-brand-accent)',
                }}
              />
            </td>
            <td style={td}>
              <code style={{ ...code, color: 'var(--color-text-subtle)' }}>{s.tailwind}</code>
            </td>
            <td style={{ ...td, color: 'var(--color-text-secondary)' }}>{s.usage}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
