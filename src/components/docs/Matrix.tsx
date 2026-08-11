/**
 * Story-only layout helper.
 *
 * The component guides all specify the same arrangement — 정렬: 타입(행) * 상태(열) —
 * so every catalog story renders through this grid instead of hand-rolling one.
 * Labels use plain custom properties rather than `type-*` utilities: they are
 * scaffolding around the specimen, not part of it.
 */
import type { ReactNode } from 'react';

export interface MatrixProps {
  /** Column headings. The guides put *state* on this axis. */
  columns: readonly string[];
  /** Row headings. The guides put *type* on this axis. */
  rows: readonly string[];
  render: (row: string, column: string) => ReactNode;
  /** Heading above the grid — used for the size axis, e.g. `sm (32)`. */
  caption?: string;
  /** Hide the row axis when a component has a single type ("타입: 없음"). */
  hideRowLabels?: boolean;
}

const label = 'text-[11px] font-semibold tracking-wide text-text-subtle uppercase';

export function Matrix({ columns, rows, render, caption, hideRowLabels = false }: MatrixProps) {
  return (
    <section className="mb-8">
      {caption && (
        <h3 className="mb-3 font-sans text-[13px] font-semibold text-text-default">{caption}</h3>
      )}

      <div
        className="inline-grid items-center gap-x-6 gap-y-4"
        style={{
          gridTemplateColumns: `${hideRowLabels ? '' : 'auto'} repeat(${columns.length}, auto)`,
        }}
      >
        {!hideRowLabels && <span />}
        {columns.map((column) => (
          <span key={column} className={label}>
            {column}
          </span>
        ))}

        {rows.map((row) => (
          <Row
            key={row}
            row={row}
            columns={columns}
            render={render}
            hideRowLabels={hideRowLabels}
          />
        ))}
      </div>
    </section>
  );
}

function Row({
  row,
  columns,
  render,
  hideRowLabels,
}: Pick<MatrixProps, 'columns' | 'render' | 'hideRowLabels'> & { row: string }) {
  return (
    <>
      {!hideRowLabels && <span className={label}>{row}</span>}
      {columns.map((column) => (
        <div key={column}>{render(row, column)}</div>
      ))}
    </>
  );
}

/** Wrapper for stories that show one specimen per line with a caption. */
export function Stack({ children }: { children: ReactNode }) {
  return <div className="flex flex-col items-start gap-6">{children}</div>;
}
