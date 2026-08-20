/**
 * Textarea — `.pen`: `Textarea / {DEFAULT|FOCUSED|DISABLED|ERROR}`.
 *
 * One size only: the box is a fixed three lines (96px) and scrolls past that,
 * per the guide. The optional character counter sits opposite the helper text on
 * the bottom row.
 */
import { useId } from 'react';

import { cn } from './cn';
import {
  FIELD_BOX,
  FIELD_BOX_FOCUS_WITHIN,
  FIELD_HELPER,
  FIELD_LABEL,
  FIELD_VALUE,
  type FieldState,
} from './field';

/** The counter is the one part that is not `text-secondary` in DEFAULT. */
const COUNTER: Record<FieldState, string> = {
  default: 'text-text-subtle',
  focused: 'text-text-subtle',
  disabled: 'text-text-disabled',
  error: 'text-text-error',
};

export interface TextareaProps
  extends Omit<React.ComponentPropsWithoutRef<'textarea'>, 'rows'> {
  label: string;
  state?: FieldState;
  helper?: string;
  errorMessage?: string;
  /** Renders `{value.length} / {maxLength}` under the box. */
  showCounter?: boolean;
  maxLength?: number;
  /**
   * `false`면 포커스 시 파란 테두리 강조를 끈다 — TextField의 `focusRing`과
   * 같은 규칙. Default `true`.
   */
  focusRing?: boolean;
}

export function Textarea({
  label,
  state = 'default',
  helper,
  errorMessage,
  showCounter = false,
  maxLength = 500,
  focusRing = true,
  className,
  id,
  value,
  defaultValue,
  ...rest
}: TextareaProps) {
  const isError = state === 'error';
  const message = isError ? (errorMessage ?? helper) : helper;
  const generatedId = useId();
  const textareaId = id ?? generatedId;
  const messageId = message ? `${textareaId}-message` : undefined;

  const current = typeof value === 'string' ? value : (defaultValue as string | undefined) ?? '';

  return (
    <div className={cn('flex w-full flex-col gap-1.5', className)}>
      <label htmlFor={textareaId} className={cn('type-label-lg', FIELD_LABEL[state])}>
        {label}
      </label>

      <div
        className={cn(
          'h-24 rounded-xl p-3',
          FIELD_BOX[state],
          state === 'default' && focusRing && FIELD_BOX_FOCUS_WITHIN,
        )}
      >
        <textarea
          id={textareaId}
          maxLength={maxLength}
          disabled={state === 'disabled'}
          aria-invalid={isError || undefined}
          aria-describedby={messageId}
          value={value}
          defaultValue={defaultValue}
          className={cn(
            'type-body-lg h-full w-full resize-none bg-transparent outline-none',
            FIELD_VALUE[state],
          )}
          {...rest}
        />
      </div>

      {(message || showCounter) && (
        <div className="flex items-start justify-between gap-3">
          <p id={messageId} className={cn('type-label-md', FIELD_HELPER[state])}>
            {message}
          </p>
          {showCounter && (
            <span className={cn('type-label-md shrink-0', COUNTER[state])}>
              {current.length} / {maxLength}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
