/**
 * Documentation-only renderers for the colour foundation.
 *
 * Every swatch paints itself with `var(--color-…)` while its caption prints the
 * hex from `colors.ts`. If the CSS layer and the token data ever disagree, the
 * page shows it rather than hiding it.
 */
import type { CSSProperties, ReactNode } from 'react';

import {
  ALPHA_SCALES,
  CONTRAST_BASE,
  PRIMITIVE_SCALES,
  SEMANTIC_GROUPS,
  resolveRef,
  type PrimitiveScale,
  type SemanticGroup,
} from '../colors';
import { contrastRatio, grade, parseHex, round } from '../contrast';
import { mono, table, td, th } from './table';

/* -- shared bits ----------------------------------------------------------- */

/** Alpha swatches sit on a checkerboard so transparency is visible. */
const CHECKERBOARD: CSSProperties = {
  backgroundImage:
    'linear-gradient(45deg, #e9e2da 25%, transparent 25%, transparent 75%, #e9e2da 75%), linear-gradient(45deg, #e9e2da 25%, transparent 25%, transparent 75%, #e9e2da 75%)',
  backgroundSize: '12px 12px',
  backgroundPosition: '0 0, 6px 6px',
  backgroundColor: '#ffffff',
};

const section: CSSProperties = { margin: '0 0 40px' };

const rowLabel: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 2,
  minWidth: 148,
  paddingRight: 16,
};

function Badge({ ok, children }: { ok: boolean; children: ReactNode }) {
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '1px 7px',
        borderRadius: 999,
        fontSize: 11,
        fontWeight: 600,
        whiteSpace: 'nowrap',
        color: ok ? 'var(--color-text-success)' : 'var(--color-text-subtle)',
        background: ok ? 'var(--color-background-success)' : 'var(--color-background-subtle)',
        border: `1px solid ${ok ? 'var(--color-border-success)' : 'var(--color-border-default)'}`,
      }}
    >
      {children}
    </span>
  );
}

/* -- primitive palettes ---------------------------------------------------- */

function PaletteRow({ scale, alpha = false }: { scale: PrimitiveScale; alpha?: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', margin: '0 0 20px' }}>
      <div style={rowLabel}>
        <strong style={{ fontSize: 14 }}>{scale.label}</strong>
        <span style={{ fontSize: 12, color: 'var(--color-text-subtle)' }}>{scale.role}</span>
        <code style={{ fontFamily: mono, fontSize: 11, color: 'var(--color-text-subtle)' }}>
          color-{scale.key}-*
        </code>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {scale.steps.map((s) => {
          // Label colour is chosen so it stays legible on its own swatch.
          const onDark = !alpha && contrastRatio('#ffffff', s.hex) >= 3;
          return (
            <div key={s.token} style={{ width: 64 }}>
              <div
                title={`${s.token} · ${s.hex}`}
                style={{
                  ...(alpha ? CHECKERBOARD : null),
                  height: 64,
                  borderRadius: 6,
                  border: '1px solid var(--color-border-default)',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: `var(--${s.token})`,
                    display: 'flex',
                    alignItems: 'flex-end',
                    padding: 6,
                    fontFamily: mono,
                    fontSize: 11,
                    fontWeight: 600,
                    color: onDark ? '#ffffff' : '#1f1a17',
                  }}
                >
                  {alpha ? '' : s.step}
                </div>
              </div>
              <div
                style={{
                  marginTop: 4,
                  fontFamily: mono,
                  fontSize: 10,
                  color: 'var(--color-text-subtle)',
                  wordBreak: 'break-all',
                }}
              >
                {alpha ? s.step : s.hex}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function PrimitivePalette() {
  return (
    <div style={section}>
      {PRIMITIVE_SCALES.map((s) => (
        <PaletteRow key={s.key} scale={s} />
      ))}
    </div>
  );
}

export function AlphaPalette() {
  return (
    <div style={section}>
      {ALPHA_SCALES.map((s) => (
        <PaletteRow key={s.key} scale={s} alpha />
      ))}
    </div>
  );
}

/* -- contrast ------------------------------------------------------------- */

/** Lowest step in each ramp that clears the given ratio against neutral-50. */
function firstPassing(scale: PrimitiveScale, min: number) {
  return scale.steps.find((s) => contrastRatio(s.hex, CONTRAST_BASE.hex) >= min)?.step;
}

export function ContrastSummary() {
  return (
    <table style={table}>
      <thead>
        <tr>
          <th style={th}>팔레트</th>
          <th style={th}>3:1 최초 통과 단계</th>
          <th style={th}>4.5:1 최초 통과 단계</th>
        </tr>
      </thead>
      <tbody>
        {PRIMITIVE_SCALES.map((s) => {
          const three = firstPassing(s, 3);
          const fourFive = firstPassing(s, 4.5);
          return (
            <tr key={s.key}>
              <td style={td}>
                <code style={{ fontFamily: mono }}>color-{s.key}-*</code>
              </td>
              <td style={td}>{three ? <Badge ok>{three}</Badge> : <Badge ok={false}>없음</Badge>}</td>
              <td style={td}>
                {fourFive ? <Badge ok>{fourFive}</Badge> : <Badge ok={false}>없음</Badge>}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

export function ContrastDetail() {
  return (
    <div style={section}>
      {PRIMITIVE_SCALES.map((scale) => (
        <div key={scale.key} style={{ margin: '0 0 24px' }}>
          <h4 style={{ margin: '0 0 8px', fontSize: 14 }}>{scale.label}</h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {scale.steps.map((s) => {
              const ratio = contrastRatio(s.hex, CONTRAST_BASE.hex);
              const g = grade(ratio);
              return (
                <div
                  key={s.token}
                  style={{
                    width: 78,
                    padding: '6px 8px',
                    borderRadius: 6,
                    border: '1px solid var(--color-border-default)',
                    background: 'var(--color-background-surface)',
                  }}
                >
                  <div
                    style={{
                      height: 18,
                      borderRadius: 3,
                      background: `var(--${s.token})`,
                      marginBottom: 5,
                    }}
                  />
                  <div style={{ fontFamily: mono, fontSize: 11, fontWeight: 600 }}>{s.step}</div>
                  <div style={{ fontFamily: mono, fontSize: 11, color: 'var(--color-text-secondary)' }}>
                    {round(ratio).toFixed(2)}:1
                  </div>
                  <div style={{ marginTop: 3 }}>
                    <Badge ok={g !== 'Fail'}>{g}</Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

/* -- semantic tokens ------------------------------------------------------ */

function SemanticPreview({
  group,
  hex,
  bgHex,
}: {
  group: SemanticGroup;
  hex: string;
  /** Backdrop the token is designed for — keeps `text-inverse` visible. */
  bgHex: string;
}) {
  const translucent = parseHex(hex).a < 1;
  const box: CSSProperties = {
    width: 96,
    height: 34,
    borderRadius: 6,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 12,
    flexShrink: 0,
  };

  if (group.preview === 'text') {
    return (
      <div style={{ ...box, background: bgHex, color: hex, fontWeight: 600 }}>Aa 가나</div>
    );
  }
  if (group.preview === 'border') {
    return (
      <div
        style={{
          ...box,
          background: 'var(--color-background-surface)',
          border: `2px solid ${hex}`,
        }}
      />
    );
  }
  if (group.preview === 'overlay') {
    return (
      <div style={{ ...box, ...CHECKERBOARD, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: hex }} />
      </div>
    );
  }
  return (
    <div
      style={{
        ...box,
        ...(translucent ? CHECKERBOARD : null),
        position: 'relative',
        overflow: 'hidden',
        border: '1px solid var(--color-border-default)',
      }}
    >
      <div style={{ position: 'absolute', inset: 0, background: hex }} />
    </div>
  );
}

export function SemanticTokenTable({ groupKey }: { groupKey: string }) {
  const group = SEMANTIC_GROUPS.find((g) => g.key === groupKey);
  if (!group) throw new Error(`Unknown semantic group: ${groupKey}`);

  const showContrast = group.preview === 'text';

  return (
    <div>
      <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', margin: '0 0 12px' }}>
        {group.description}
      </p>
      <table style={table}>
        <thead>
          <tr>
            <th style={th}>미리보기</th>
            <th style={th}>시맨틱 토큰</th>
            <th style={th}>참조 프리미티브</th>
            <th style={th}>값</th>
            {showContrast && <th style={th}>대비 (측정 기준)</th>}
            <th style={th}>용도</th>
          </tr>
        </thead>
        <tbody>
          {group.tokens.map((t) => {
            const hex = resolveRef(t.ref);
            const bgRef = t.on ?? CONTRAST_BASE.token.replace('color-', '');
            const bgHex = t.on ? resolveRef(t.on) : CONTRAST_BASE.hex;
            const ratio = contrastRatio(hex, bgHex);
            return (
              <tr key={t.token}>
                <td style={td}>
                  <SemanticPreview group={group} hex={hex} bgHex={bgHex} />
                </td>
                <td style={td}>
                  <code style={{ fontFamily: mono, fontSize: 12 }}>{t.token}</code>
                </td>
                <td style={td}>
                  <code style={{ fontFamily: mono, fontSize: 12, color: 'var(--color-text-secondary)' }}>
                    color-{t.ref}
                  </code>
                </td>
                <td style={td}>
                  <code style={{ fontFamily: mono, fontSize: 12, color: 'var(--color-text-subtle)' }}>
                    {hex}
                  </code>
                </td>
                {showContrast && (
                  <td style={td}>
                    <div>
                      <span style={{ fontFamily: mono, fontSize: 12, marginRight: 6 }}>
                        {round(ratio).toFixed(2)}:1
                      </span>
                      {t.exempt ? (
                        <Badge ok>예외</Badge>
                      ) : (
                        <Badge ok={grade(ratio) !== 'Fail'}>{grade(ratio)}</Badge>
                      )}
                    </div>
                    <code style={{ fontFamily: mono, fontSize: 10, color: 'var(--color-text-subtle)' }}>
                      on color-{bgRef}
                    </code>
                  </td>
                )}
                <td style={{ ...td, color: 'var(--color-text-secondary)' }}>{t.usage}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
