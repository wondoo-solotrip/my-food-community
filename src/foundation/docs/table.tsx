/**
 * Shared table primitives for the foundation catalog.
 *
 * `DocTable` exists because this Storybook's MDX pipeline has no remark-gfm,
 * so pipe-delimited markdown tables render as literal text. Authoring prose
 * tables through this component keeps them styled like the generated ones and
 * avoids adding a plugin dependency.
 */
import type { CSSProperties, ReactNode } from 'react';

export const mono = 'ui-monospace, SFMono-Regular, Menlo, monospace';

export const table: CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
  fontSize: 13,
  lineHeight: 1.5,
  margin: '0 0 40px',
};

export const th: CSSProperties = {
  textAlign: 'left',
  padding: '8px 12px 8px 0',
  borderBottom: '1px solid var(--color-border-default)',
  fontWeight: 600,
  whiteSpace: 'nowrap',
};

export const td: CSSProperties = {
  padding: '8px 12px 8px 0',
  borderBottom: '1px solid var(--color-border-default)',
  verticalAlign: 'middle',
};

export const code: CSSProperties = { fontFamily: mono, fontSize: 12 };

export interface DocTableProps {
  head: ReactNode[];
  rows: ReactNode[][];
  /** Per-column alignment; defaults to left. */
  align?: ('left' | 'right')[];
}

export function DocTable({ head, rows, align = [] }: DocTableProps) {
  return (
    <table style={table}>
      <thead>
        <tr>
          {head.map((h, i) => (
            <th key={i} style={{ ...th, textAlign: align[i] ?? 'left' }}>
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={i}>
            {row.map((cell, j) => (
              <td key={j} style={{ ...td, textAlign: align[j] ?? 'left', verticalAlign: 'top' }}>
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/** Inline code cell, for token names inside `DocTable`. */
export function C({ children }: { children: ReactNode }) {
  return <code style={code}>{children}</code>;
}
