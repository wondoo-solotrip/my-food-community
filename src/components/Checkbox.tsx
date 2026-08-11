/**
 * Checkbox — `.pen`: `Checkbox / {UNCHECKED|CHECKED|INDETERMINATE} / {DEFAULT|DISABLED|ERROR} / {SM|MD}`.
 *
 * The control is drawn, not iconographic — the guide is explicit that the check
 * must not come from the icon set ("아이코노그래피 프레임내 아이콘을 사용하지 않음"),
 * so the tick is the `.pen` path `M1 4l3 3 5-6` and the indeterminate bar is a
 * 2px rectangle, both reproduced here.
 *
 * Rendered as `<button role="checkbox">` rather than `<input type="checkbox">`
 * because `aria-checked="mixed"` expresses indeterminate declaratively, while
 * the native element only exposes it as a DOM property.
 */
import { cn } from './cn';

export type CheckboxSelection = 'unchecked' | 'checked' | 'indeterminate';
export type CheckboxState = 'default' | 'disabled' | 'error';
export type CheckboxSize = 'sm' | 'md';

const BOX: Record<CheckboxSize, string> = {
  sm: 'size-4 rounded-sm',
  md: 'size-5 rounded-[5px]',
};

/** Mark width in px: `.pen` draws 12 inside the 20 control, scaled for sm. */
const MARK_WIDTH: Record<CheckboxSize, number> = { sm: 10, md: 12 };

const LABEL: Record<CheckboxState, string> = {
  default: 'text-text-default',
  disabled: 'text-text-disabled',
  error: 'text-text-error',
};

/** DISABLED wins over selection for the fill; selection drives it otherwise. */
function fill(selected: boolean, state: CheckboxState) {
  if (state === 'disabled') return 'bg-background-disabled';
  return selected ? 'bg-background-brand' : 'bg-background-surface';
}

/** ERROR keeps its border even when checked — that is how `.pen` draws it. */
function border(selected: boolean, state: CheckboxState) {
  if (state === 'error') return 'border-border-error';
  if (state === 'disabled') return 'border-border-disabled';
  return selected ? 'border-border-brand' : 'border-border-strong';
}

export interface CheckboxProps
  extends Omit<React.ComponentPropsWithoutRef<'button'>, 'children' | 'value'> {
  label: string;
  selection?: CheckboxSelection;
  state?: CheckboxState;
  size?: CheckboxSize;
}

export function Checkbox({
  label,
  selection = 'unchecked',
  state = 'default',
  size = 'md',
  className,
  type = 'button',
  ...rest
}: CheckboxProps) {
  const selected = selection !== 'unchecked';
  const markWidth = MARK_WIDTH[size];

  return (
    <button
      type={type}
      role="checkbox"
      aria-checked={selection === 'indeterminate' ? 'mixed' : selection === 'checked'}
      aria-invalid={state === 'error' || undefined}
      disabled={state === 'disabled'}
      className={cn(
        'inline-flex items-center gap-2 text-left',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus',
        className,
      )}
      {...rest}
    >
      <span
        className={cn(
          'flex shrink-0 items-center justify-center border',
          BOX[size],
          fill(selected, state),
          border(selected, state),
          state === 'disabled' ? 'text-text-disabled' : 'text-text-on-brand',
        )}
      >
        {selection === 'checked' && (
          <svg
            width={markWidth}
            height={(markWidth * 8) / 10}
            viewBox="0 0 10 8"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M1 4l3 3 5-6"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
        {selection === 'indeterminate' && (
          <span
            className="h-0.5 rounded-[1px] bg-current"
            style={{ width: markWidth }}
            aria-hidden="true"
          />
        )}
      </span>

      <span className={cn('type-body-md', LABEL[state])}>{label}</span>
    </button>
  );
}
