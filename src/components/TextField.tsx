/**
 * TextField — `.pen`: `Text Field / {TEXT|PASSWORD} / {DEFAULT|FOCUSED|DISABLED|ERROR} / {SM|MD|LG}`.
 *
 * 24 `.pen` components collapse into `type` × `state` × `size`. The input is a
 * real `<input>`, so `type="password"` masks for free — in the design file the
 * two types differ only in their label and placeholder copy.
 *
 * The error row replaces the hint with the error message, per the guide
 * ("에러시 힌트 대체"), which is why `helper` and `errorMessage` are separate props.
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
  FIELD_VALUE,
  type FieldSize,
  type FieldState,
} from './field';

export interface TextFieldProps
  extends Omit<React.ComponentPropsWithoutRef<'input'>, 'size' | 'type'> {
  label: string;
  /**
   * Visually hides the label (kept for screen readers). `.pen` instances such
   * as the main-page search disable the label row while keeping the box.
   */
  hideLabel?: boolean;
  type?: 'text' | 'password';
  size?: FieldSize;
  state?: FieldState;
  /** Hint under the field. Replaced by `errorMessage` when state is `error`. */
  helper?: string;
  errorMessage?: string;
  leadingIcon?: string;
  trailingIcon?: string;
  /**
   * 누를 수 있는 트레일링 아이콘 — `.pen` 08 장소 검색의 입력 지우기(X)처럼
   * 동작이 필요한 자리. `trailingIcon`(장식)과 동시에 쓰면 이쪽이 우선한다.
   */
  trailingAction?: { icon: string; label: string; onClick: () => void };
}

export function TextField({
  label,
  hideLabel = false,
  type = 'text',
  size = 'md',
  state = 'default',
  helper,
  errorMessage,
  leadingIcon,
  trailingIcon,
  trailingAction,
  className,
  id,
  ...rest
}: TextFieldProps) {
  const iconSize = FIELD_ICON_SIZE[size];
  const isError = state === 'error';
  const isDisabled = state === 'disabled';
  const message = isError ? (errorMessage ?? helper) : helper;

  // Generated rather than derived from the label: the catalog renders the same
  // label 24 times, and duplicate ids would break every `htmlFor` but the first.
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const messageId = message ? `${inputId}-message` : undefined;

  return (
    <div className={cn('flex w-full flex-col gap-1.5', className)}>
      <label
        htmlFor={inputId}
        className={cn('type-label-lg', FIELD_LABEL[state], hideLabel && 'sr-only')}
      >
        {label}
      </label>

      <div
        className={cn(
          'flex items-center gap-2 rounded-xl px-3',
          FIELD_HEIGHT[size],
          FIELD_BOX[state],
          state === 'default' && FIELD_BOX_FOCUS_WITHIN,
        )}
      >
        {leadingIcon && (
          <span className={FIELD_ICON[state]}>
            <Icon name={leadingIcon} size={iconSize} />
          </span>
        )}

        <input
          id={inputId}
          type={type}
          disabled={isDisabled}
          aria-invalid={isError || undefined}
          aria-describedby={messageId}
          className={cn(
            // The box already owns the border, height and background, so the
            // input itself has to contribute nothing but the text.
            'type-body-lg min-w-0 flex-1 bg-transparent outline-none',
            FIELD_VALUE[state],
          )}
          {...rest}
        />

        {trailingAction ? (
          <button
            type="button"
            aria-label={trailingAction.label}
            disabled={isDisabled}
            onClick={trailingAction.onClick}
            className={cn(
              'flex shrink-0 items-center justify-center rounded-full',
              'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus',
              FIELD_ICON[state],
            )}
          >
            <Icon name={trailingAction.icon} size={iconSize} />
          </button>
        ) : (
          trailingIcon && (
            <span className={FIELD_ICON[state]}>
              <Icon name={trailingIcon} size={iconSize} />
            </span>
          )
        )}
      </div>

      {message && (
        <p id={messageId} className={cn('type-label-md', FIELD_HELPER[state])}>
          {message}
        </p>
      )}
    </div>
  );
}
