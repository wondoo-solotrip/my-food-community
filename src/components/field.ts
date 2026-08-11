/**
 * Shared state→token maps for the bordered form controls.
 *
 * Text Field, Textarea and Select are three different `.pen` families, but their
 * DEFAULT / FOCUSED / DISABLED / ERROR rows resolve to exactly the same tokens:
 * the same four border colours, the same fills, the same label and helper
 * colours. Keeping one copy means a token change lands on all three at once, and
 * makes any future divergence between them explicit rather than accidental.
 */

/** The four state columns every bordered field family ships in `.pen`. */
export type FieldState = 'default' | 'focused' | 'disabled' | 'error';
export type FieldSize = 'sm' | 'md' | 'lg';

/** Fill + border of the input box. FOCUSED is the only 2px border. */
export const FIELD_BOX: Record<FieldState, string> = {
  default: 'bg-background-surface border border-border-default',
  focused: 'bg-background-surface border-2 border-border-focus',
  disabled: 'bg-background-disabled border border-border-disabled',
  error: 'bg-background-surface border border-border-error',
};

/**
 * Live focus for a field left in its DEFAULT state. `.pen` can only draw
 * FOCUSED as a separate frame; in code the real pseudo-class does the work.
 */
export const FIELD_BOX_FOCUS_WITHIN =
  'focus-within:border-2 focus-within:border-border-focus';

export const FIELD_LABEL: Record<FieldState, string> = {
  default: 'text-text-default',
  focused: 'text-text-default',
  disabled: 'text-text-disabled',
  error: 'text-text-default',
};

/** Value text plus its placeholder — `.pen` shows those as two separate rows. */
export const FIELD_VALUE: Record<FieldState, string> = {
  default: 'text-text-default placeholder:text-text-subtle',
  focused: 'text-text-default placeholder:text-text-subtle',
  disabled: 'text-text-disabled placeholder:text-text-disabled',
  error: 'text-text-error placeholder:text-text-error',
};

export const FIELD_ICON: Record<FieldState, string> = {
  default: 'text-text-secondary',
  focused: 'text-text-secondary',
  disabled: 'text-text-disabled',
  error: 'text-text-error',
};

export const FIELD_HELPER: Record<FieldState, string> = {
  default: 'text-text-secondary',
  focused: 'text-text-secondary',
  disabled: 'text-text-disabled',
  error: 'text-text-error',
};

export const FIELD_HEIGHT: Record<FieldSize, string> = {
  sm: 'h-8',
  md: 'h-10',
  lg: 'h-12',
};

/** Guide: sm 16px, md 20px, lg 20px — lg deliberately reuses md's icon size. */
export const FIELD_ICON_SIZE: Record<FieldSize, 16 | 20> = { sm: 16, md: 20, lg: 20 };

export const FIELD_SIZES: FieldSize[] = ['sm', 'md', 'lg'];
export const FIELD_STATES: FieldState[] = ['default', 'focused', 'disabled', 'error'];

/** Row captions used by the catalog stories. */
export const FIELD_SIZE_LABEL: Record<FieldSize, string> = {
  sm: 'sm (32)',
  md: 'md (40)',
  lg: 'lg (48)',
};
