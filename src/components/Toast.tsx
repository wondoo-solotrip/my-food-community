/**
 * Toast — `.pen`: `Toast / {SUCCESS|ERROR|INFO|WARNING} / {MOBILE|DESKTOP}`.
 *
 * The two viewport rows are a width rule, not a variant: mobile fills the screen
 * minus its margins, desktop is a fixed 400. Everything else — 56px tall, warm
 * surface fill, type-coloured border and status glyph — is shared.
 */
import { Icon } from './Icon';
import { cn } from './cn';

export type ToastType = 'success' | 'error' | 'info' | 'warning';
export type ToastViewport = 'mobile' | 'desktop';

const STATUS_ICON: Record<ToastType, string> = {
  success: 'check',
  error: 'error',
  info: 'info',
  warning: 'warning',
};

const BORDER: Record<ToastType, string> = {
  success: 'border-border-success',
  error: 'border-border-error',
  info: 'border-border-information',
  warning: 'border-border-warning',
};

const TONE: Record<ToastType, string> = {
  success: 'text-text-success',
  error: 'text-text-error',
  info: 'text-text-information',
  warning: 'text-text-warning',
};

/** Mobile fills its container; desktop is pinned to the design's 400px. */
const WIDTH: Record<ToastViewport, string> = {
  mobile: 'w-full',
  desktop: 'w-[400px]',
};

export interface ToastProps extends React.ComponentPropsWithoutRef<'div'> {
  type?: ToastType;
  message: string;
  viewport?: ToastViewport;
  /** The close affordance is optional per the guide. */
  onClose?: () => void;
}

export function Toast({
  type = 'success',
  message,
  viewport = 'mobile',
  onClose,
  className,
  ...rest
}: ToastProps) {
  return (
    <div
      // `status` rather than `alert`: these are confirmations, and an assertive
      // live region would interrupt whatever the user is doing.
      role="status"
      className={cn(
        // min-h rather than h: the register page's summary wraps to two lines
        // (64px in the .pen); a single-line message still renders at 56.
        'flex min-h-14 items-center gap-2.5 rounded-xl border bg-background-surface px-3.5 py-2',
        WIDTH[viewport],
        BORDER[type],
        className,
      )}
      {...rest}
    >
      <span className={cn('shrink-0', TONE[type])}>
        <Icon name={STATUS_ICON[type]} size={20} />
      </span>

      <p className="type-body-md min-w-0 flex-1 text-text-default">{message}</p>

      {onClose && (
        <button
          type="button"
          aria-label="닫기"
          onClick={onClose}
          className="shrink-0 text-text-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus"
        >
          <Icon name="close" size={20} />
        </button>
      )}
    </div>
  );
}
