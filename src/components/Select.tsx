/**
 * Select and SelectItem — `.pen`: `Select / {DEFAULT|FOCUSED|DISABLED|ERROR} / {SM|MD|LG}`
 * and `Select Item / {DEFAULT|SELECTED|DISABLED} / {SM|MD|LG}`.
 *
 * FOCUSED means "panel is open" in this design, not merely "has focus" — which is
 * why the chevron flips in that state. `open` drives both the visual state and
 * `aria-expanded`.
 *
 * The two are separate `.pen` families and stay separate components: the guide
 * has the item follow whatever size its select was given, and mounts the list in
 * a bottom sheet on mobile but directly under the trigger on desktop, so the
 * caller owns that placement.
 */
import { useId } from 'react';

import { Icon } from './Icon';
import { cn } from './cn';
import {
  FIELD_BOX,
  FIELD_BOX_FOCUS_WITHIN,
  FIELD_HEIGHT,
  FIELD_HELPER,
  FIELD_ICON,
  FIELD_ICON_SIZE,
  FIELD_LABEL,
  type FieldSize,
  type FieldState,
} from './field';

export interface SelectProps
  extends Omit<React.ComponentPropsWithoutRef<'button'>, 'children' | 'value'> {
  label: string;
  /** Chosen value. Falls back to `placeholder` styling when empty. */
  value?: string;
  placeholder?: string;
  size?: FieldSize;
  state?: FieldState;
  helper?: string;
  errorMessage?: string;
  /** `.pen` FOCUSED — kept while the option panel is open. */
  open?: boolean;
  /**
   * `id` of the `SelectList` this trigger controls. The panel lives wherever the
   * caller mounts it — under the trigger on desktop, in a bottom sheet on mobile
   * — so the association has to be passed in rather than inferred.
   */
  listboxId?: string;
}

export function Select({
  label,
  value,
  placeholder = '선택하세요',
  size = 'md',
  state = 'default',
  helper,
  errorMessage,
  open = false,
  listboxId,
  className,
  id,
  type = 'button',
  ...rest
}: SelectProps) {
  const isError = state === 'error';
  const message = isError ? (errorMessage ?? helper) : helper;
  const generatedId = useId();
  const triggerId = id ?? generatedId;
  const messageId = message ? `${triggerId}-message` : undefined;

  // Value colour is not part of the shared field map: the placeholder is a
  // sibling text node here, not a real `::placeholder`.
  const valueTone = isError
    ? 'text-text-error'
    : state === 'disabled'
      ? 'text-text-disabled'
      : value
        ? 'text-text-default'
        : 'text-text-subtle';

  return (
    <div className={cn('flex w-full flex-col gap-1.5', className)}>
      <label htmlFor={triggerId} className={cn('type-label-lg', FIELD_LABEL[state])}>
        {label}
      </label>

      <button
        id={triggerId}
        type={type}
        role="combobox"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-haspopup="listbox"
        aria-invalid={isError || undefined}
        aria-describedby={messageId}
        disabled={state === 'disabled'}
        className={cn(
          'flex w-full items-center gap-2 rounded-xl px-3 text-left',
          FIELD_HEIGHT[size],
          FIELD_BOX[state],
          state === 'default' && FIELD_BOX_FOCUS_WITHIN,
        )}
        {...rest}
      >
        <span className={cn('type-body-lg min-w-0 flex-1 truncate', valueTone)}>
          {value ?? placeholder}
        </span>
        <span className={cn(FIELD_ICON[state], open && 'rotate-180')}>
          <Icon name="chevron-down" size={FIELD_ICON_SIZE[size]} />
        </span>
      </button>

      {message && (
        <p id={messageId} className={cn('type-label-md', FIELD_HELPER[state])}>
          {message}
        </p>
      )}
    </div>
  );
}

/* -- Select Item ----------------------------------------------------------- */

export type SelectItemState = 'default' | 'selected' | 'disabled';

const ITEM_BOX: Record<SelectItemState, string> = {
  default: 'bg-background-surface',
  selected: 'bg-background-brand',
  disabled: 'bg-background-disabled',
};

const ITEM_LABEL: Record<SelectItemState, string> = {
  default: 'text-text-default',
  selected: 'text-text-on-brand',
  disabled: 'text-text-disabled',
};

const ITEM_CHECK: Record<SelectItemState, string> = {
  default: 'text-text-on-brand',
  selected: 'text-text-on-brand',
  disabled: 'text-text-disabled',
};

export interface SelectItemProps
  extends Omit<React.ComponentPropsWithoutRef<'button'>, 'children'> {
  label: string;
  state?: SelectItemState;
  /** Follows the size of the select it belongs to. */
  size?: FieldSize;
}

export function SelectItem({
  label,
  state = 'default',
  size = 'md',
  className,
  type = 'button',
  ...rest
}: SelectItemProps) {
  return (
    <button
      type={type}
      role="option"
      aria-selected={state === 'selected'}
      disabled={state === 'disabled'}
      className={cn(
        'flex w-full items-center gap-2 border-b border-border-default px-3 text-left',
        FIELD_HEIGHT[size],
        ITEM_BOX[state],
        className,
      )}
      {...rest}
    >
      <span className={cn('type-body-lg min-w-0 flex-1 truncate', ITEM_LABEL[state])}>{label}</span>
      {/* Kept mounted but transparent when unselected: `.pen` reserves the slot
          with `opacity: 0` so the label never shifts on selection. */}
      <span
        className={cn(ITEM_CHECK[state], state !== 'selected' && 'opacity-0')}
        aria-hidden="true"
      >
        <Icon name="check" size={FIELD_ICON_SIZE[size]} />
      </span>
    </button>
  );
}

/** Wrapper that gives a run of `SelectItem`s the listbox role they belong to. */
export function SelectList({
  label,
  className,
  children,
  ...rest
}: React.ComponentPropsWithoutRef<'div'> & { label: string }) {
  return (
    <div role="listbox" aria-label={label} className={cn('flex flex-col', className)} {...rest}>
      {children}
    </div>
  );
}
