/**
 * BottomSheet — `.pen`: `Bottom Sheet / Default`.
 *
 * Full-width surface pinned to the bottom over a `color-overlay-dark-50` scrim,
 * with a drag handle on top. Tapping the scrim dismisses without selecting.
 *
 * The design file fills the handle with a raw `#000000`; here it uses
 * `color-background-inverse`, the nearest semantic token. See the deviations table.
 */
import { cn } from './cn';

export interface BottomSheetProps extends React.ComponentPropsWithoutRef<'div'> {
  title?: string;
  description?: string;
  children?: React.ReactNode;
  onClose?: () => void;
  /** `fixed` for app use, `absolute` to sit inside a sized preview frame. */
  position?: 'fixed' | 'absolute';
  /**
   * Header alignment. The select-panel sheets centre their header; the payment
   * sheet (.pen `16 Payment Sheet`) left-aligns it — pass `start` for those.
   */
  align?: 'center' | 'start';
}

export function BottomSheet({
  title,
  description,
  children,
  onClose,
  position = 'fixed',
  align = 'center',
  className,
  ...rest
}: BottomSheetProps) {
  return (
    <div
      className={cn(
        'inset-0 flex items-end bg-overlay-dark-50',
        position === 'fixed' ? 'fixed' : 'absolute',
        className,
      )}
      onClick={onClose}
      {...rest}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title ?? '바텀시트'}
        onClick={(event) => event.stopPropagation()}
        className="flex w-full flex-col items-center gap-[18px] rounded-t-[20px] bg-background-surface px-5 pt-2.5 pb-6"
      >
        <span
          className="h-1 w-10 shrink-0 rounded-[2px] bg-background-inverse"
          aria-hidden="true"
        />

        {(title || description) && (
          <div
            className={cn(
              'flex w-full flex-col gap-2',
              align === 'start' ? 'items-start' : 'items-center',
            )}
          >
            {title && <h2 className="type-heading-sm text-text-default">{title}</h2>}
            {description && (
              <p
                className={cn(
                  'type-body-md w-full text-text-secondary',
                  align === 'center' && 'text-center',
                )}
              >
                {description}
              </p>
            )}
          </div>
        )}

        {children && <div className="flex w-full flex-col gap-1">{children}</div>}
      </div>
    </div>
  );
}
