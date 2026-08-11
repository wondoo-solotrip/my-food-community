/**
 * Documentation-only renderers for the UI component overview.
 *
 * Reuses the foundation pages' table primitives so both halves of the handoff
 * look like one document, and reads every number out of `inventory.ts` so the
 * page cannot claim a count the ledger does not support.
 */
import { code, mono, table, td, th } from '../../foundation/docs/table';
import {
  ADDITIONS,
  CODE_COMPONENT_COUNT,
  COMPONENTS,
  DEVIATIONS,
  FAMILY_COUNT,
  GROUP_LABEL,
  GROUP_SOURCE,
  NON_UI_PEN_COMPONENTS,
  NON_UI_PEN_COUNT,
  OMISSIONS,
  TOTAL_PEN_COUNT,
  UI_PEN_COUNT,
  type ComponentGroup,
} from './inventory';

const GROUPS: ComponentGroup[] = ['action', 'form', 'navigation', 'feedback', 'etc'];

const groupHeading: React.CSSProperties = {
  margin: '24px 0 8px',
  fontSize: 13,
  fontWeight: 600,
  color: 'var(--color-text-default)',
};

/**
 * Renders `` `backticked` `` spans in a plain string as inline code.
 *
 * The difference tables carry a lot of token names, and these strings live in
 * `inventory.ts` rather than in MDX prose — so nothing would otherwise turn the
 * markdown into markup, and the backticks would show up literally.
 */
function Prose({ children }: { children: string }) {
  return (
    <>
      {children.split('`').map((part, index) =>
        index % 2 === 1 ? (
          <code key={index} style={{ ...code, fontSize: 11 }}>
            {part}
          </code>
        ) : (
          part
        ),
      )}
    </>
  );
}

/** Totals, derived rather than asserted. */
export function HandoffSummary() {
  const rows: [string, string, string][] = [
    ['UI 컴포넌트', `${UI_PEN_COUNT}개`, `${FAMILY_COUNT}개 계열 · 코드 ${CODE_COMPONENT_COUNT}개 컴포넌트`],
    ['파운데이션 컴포넌트', `${NON_UI_PEN_COUNT}개`, NON_UI_PEN_COMPONENTS.map((c) => c.note).join(' · ')],
    ['합계', `${TOTAL_PEN_COUNT}개`, 'design.pen의 reusable 컴포넌트 전체'],
  ];

  return (
    <table style={table}>
      <thead>
        <tr>
          <th style={th}>구분</th>
          <th style={th}>.pen 컴포넌트</th>
          <th style={th}>비고</th>
        </tr>
      </thead>
      <tbody>
        {rows.map(([label, count, note]) => (
          <tr key={label}>
            <td style={{ ...td, fontWeight: label === '합계' ? 600 : 400 }}>{label}</td>
            <td style={td}>
              <code style={code}>{count}</code>
            </td>
            <td style={{ ...td, color: 'var(--color-text-secondary)' }}>{note}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/** The mapping table: one row per `.pen` family. */
export function ComponentInventory() {
  return (
    <div>
      {GROUPS.map((group) => {
        const entries = COMPONENTS.filter((c) => c.group === group);
        const count = entries.reduce((sum, c) => sum + c.penCount, 0);

        return (
          <div key={group}>
            <h4 style={groupHeading}>
              {GROUP_LABEL[group]}{' '}
              <span style={{ fontWeight: 400, color: 'var(--color-text-subtle)' }}>
                — 가이드 {GROUP_SOURCE[group]} · .pen {count}개
              </span>
            </h4>

            <table style={table}>
              <thead>
                <tr>
                  <th style={th}>Storybook</th>
                  <th style={th}>.pen 컴포넌트</th>
                  <th style={{ ...th, textAlign: 'right' }}>개수</th>
                  <th style={th}>코드</th>
                  <th style={th}>변형 축</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry) => (
                  <tr key={entry.pen}>
                    <td style={td}>{entry.name}</td>
                    <td style={td}>
                      <code style={{ ...code, fontSize: 11 }}>{entry.pen}</code>
                    </td>
                    <td style={{ ...td, textAlign: 'right', fontFamily: mono }}>{entry.penCount}</td>
                    <td style={td}>
                      {entry.code.map((name) => (
                        <code key={name} style={{ ...code, marginRight: 4 }}>
                          {'<'}
                          {name}
                          {'>'}
                        </code>
                      ))}
                    </td>
                    <td style={{ ...td, color: 'var(--color-text-secondary)', fontSize: 12 }}>
                      {entry.axes}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      })}
    </div>
  );
}

export function DeviationTable() {
  return (
    <table style={table}>
      <thead>
        <tr>
          <th style={th}>위치</th>
          <th style={th}>설계 / 가이드</th>
          <th style={th}>코드</th>
          <th style={th}>이유</th>
        </tr>
      </thead>
      <tbody>
        {DEVIATIONS.map((d) => (
          <tr key={d.where}>
            <td style={{ ...td, fontWeight: 600, whiteSpace: 'nowrap' }}>{d.where}</td>
            <td style={{ ...td, color: 'var(--color-text-secondary)', fontSize: 12 }}>
              <Prose>{d.design}</Prose>
            </td>
            <td style={{ ...td, fontSize: 12 }}>
              <Prose>{d.code}</Prose>
            </td>
            <td style={{ ...td, color: 'var(--color-text-secondary)', fontSize: 12 }}>
              <Prose>{d.why}</Prose>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function ReasonList({ items }: { items: { what: string; why: string }[] }) {
  return (
    <table style={table}>
      <thead>
        <tr>
          <th style={th}>항목</th>
          <th style={th}>이유</th>
        </tr>
      </thead>
      <tbody>
        {items.map((item) => (
          <tr key={item.what}>
            <td style={{ ...td, fontSize: 12 }}>
              <Prose>{item.what}</Prose>
            </td>
            <td style={{ ...td, color: 'var(--color-text-secondary)', fontSize: 12 }}>
              <Prose>{item.why}</Prose>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function AdditionTable() {
  return <ReasonList items={ADDITIONS} />;
}

export function OmissionTable() {
  return <ReasonList items={OMISSIONS} />;
}

export { CODE_COMPONENT_COUNT, FAMILY_COUNT, UI_PEN_COUNT };
