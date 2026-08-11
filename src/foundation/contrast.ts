/** WCAG 2.1 contrast helpers, used by the colour catalog. */

export interface Rgba {
  r: number;
  g: number;
  b: number;
  a: number;
}

/** Parses `#rgb`, `#rrggbb` and `#rrggbbaa`. */
export function parseHex(hex: string): Rgba {
  let h = hex.trim().replace(/^#/, '');

  if (h.length === 3 || h.length === 4) {
    h = [...h].map((c) => c + c).join('');
  }
  if (h.length !== 6 && h.length !== 8) {
    throw new Error(`Unsupported hex colour: ${hex}`);
  }

  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
    a: h.length === 8 ? parseInt(h.slice(6, 8), 16) / 255 : 1,
  };
}

/** Flattens a translucent colour onto an opaque backdrop. */
export function composite(fg: Rgba, bg: Rgba): Rgba {
  return {
    r: fg.r * fg.a + bg.r * (1 - fg.a),
    g: fg.g * fg.a + bg.g * (1 - fg.a),
    b: fg.b * fg.a + bg.b * (1 - fg.a),
    a: 1,
  };
}

function relativeLuminance({ r, g, b }: Rgba): number {
  const channel = (v: number) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

/**
 * Contrast ratio between two colours, 1–21.
 * A translucent `foreground` is first composited onto `background`.
 */
export function contrastRatio(foreground: string, background: string): number {
  const bg = parseHex(background);
  const fgRaw = parseHex(foreground);
  const fg = fgRaw.a < 1 ? composite(fgRaw, bg) : fgRaw;

  const l1 = relativeLuminance(fg);
  const l2 = relativeLuminance(bg);
  const [lighter, darker] = l1 > l2 ? [l1, l2] : [l2, l1];

  return (lighter + 0.05) / (darker + 0.05);
}

export type ContrastGrade = 'AAA' | 'AA' | 'AA Large' | 'Fail';

/** Grades a ratio for normal-size body text, per WCAG 2.1 §1.4.3 / §1.4.11. */
export function grade(ratio: number): ContrastGrade {
  if (ratio >= 7) return 'AAA';
  if (ratio >= 4.5) return 'AA';
  if (ratio >= 3) return 'AA Large';
  return 'Fail';
}

export const round = (ratio: number) => Math.round(ratio * 100) / 100;
