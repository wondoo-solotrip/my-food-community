/**
 * Documentation-only renderers for the iconography foundation.
 *
 * The glyph renderer itself is no longer here: the UI-component handoff promoted
 * it to `components/Icon`, so this page and the components draw from one
 * implementation. Everything below is catalog scaffolding around it.
 */
import { Icon } from '../../components/Icon';
import { ICONS, ICON_SIZES } from '../icons';
import { code, mono, table, td, th } from './table';

/* -- catalog -------------------------------------------------------------- */

/** Every icon, each shown at all four sizes. */
export function IconCatalog() {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(224px, 1fr))',
        gap: 12,
        margin: '0 0 40px',
      }}
    >
      {ICONS.map((icon) => (
        <div
          key={icon.name}
          style={{
            border: '1px solid var(--color-border-default)',
            borderRadius: 8,
            padding: '12px 14px',
            background: 'var(--color-background-surface)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-end',
              gap: 12,
              height: 36,
              color: 'var(--color-text-default)',
            }}
          >
            {ICON_SIZES.map((size) => (
              <Icon key={size} name={icon.name} size={size} />
            ))}
          </div>

          <div style={{ marginTop: 10, fontFamily: mono, fontSize: 12, fontWeight: 600 }}>
            {icon.name}
          </div>
          {icon.name !== icon.lucide && (
            <div style={{ fontFamily: mono, fontSize: 11, color: 'var(--color-text-subtle)' }}>
              lucide: {icon.lucide}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/* -- sizes ---------------------------------------------------------------- */

export function IconSizeScale({ name = 'bookmark' }: { name?: string }) {
  const usage: Record<number, string> = {
    16: '조밀한 인라인 (라벨 옆, 칩)',
    20: '입력 필드, 리스트 아이템',
    24: '기본 크기 · 버튼, 내비게이션',
    32: '강조, 빈 상태 일러스트',
  };

  return (
    <table style={table}>
      <thead>
        <tr>
          <th style={th}>미리보기</th>
          <th style={th}>크기</th>
          <th style={th}>용도</th>
        </tr>
      </thead>
      <tbody>
        {ICON_SIZES.map((size) => (
          <tr key={size}>
            <td style={{ ...td, color: 'var(--color-text-default)' }}>
              <div style={{ display: 'flex', alignItems: 'center', height: 40 }}>
                <Icon name={name} size={size} />
              </div>
            </td>
            <td style={td}>
              <code style={code}>{size}px</code>
            </td>
            <td style={{ ...td, color: 'var(--color-text-secondary)' }}>{usage[size]}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/* -- colour --------------------------------------------------------------- */

/** Icons inherit `currentColor`, so semantic text tokens drive them directly. */
export function IconColorDemo() {
  const tokens = [
    'color-text-default',
    'color-text-secondary',
    'color-text-subtle',
    'color-text-disabled',
    'color-text-brand',
    'color-text-error',
    'color-text-warning',
    'color-text-success',
    'color-text-information',
  ];

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, margin: '0 0 40px' }}>
      {tokens.map((token) => (
        <div
          key={token}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '8px 12px',
            border: '1px solid var(--color-border-default)',
            borderRadius: 8,
            background: 'var(--color-background-surface)',
            color: `var(--${token})`,
          }}
        >
          <Icon name="heart" size={20} />
          <code style={{ ...code, fontSize: 11 }}>{token.replace('color-text-', '')}</code>
        </div>
      ))}
    </div>
  );
}

/* -- rename map ----------------------------------------------------------- */

/** Icons whose design-system name differs from the upstream Lucide name. */
export function IconRenameTable() {
  const renamed = ICONS.filter((i) => i.name !== i.lucide);

  return (
    <table style={table}>
      <thead>
        <tr>
          <th style={th}> </th>
          <th style={th}>디자인 시스템 이름</th>
          <th style={th}>Lucide 원본 이름</th>
        </tr>
      </thead>
      <tbody>
        {renamed.map((i) => (
          <tr key={i.name}>
            <td style={{ ...td, width: 32, color: 'var(--color-text-default)' }}>
              <Icon name={i.name} size={20} />
            </td>
            <td style={td}>
              <code style={{ ...code, fontWeight: 600 }}>{i.name}</code>
            </td>
            <td style={td}>
              <code style={{ ...code, color: 'var(--color-text-subtle)' }}>{i.lucide}</code>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export const ICON_COUNT = ICONS.length;
export const RENAMED_COUNT = ICONS.filter((i) => i.name !== i.lucide).length;
