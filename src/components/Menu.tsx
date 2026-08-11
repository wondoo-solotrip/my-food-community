/**
 * Menu and MenuItem — `.pen`: `Menu / Default` and
 * `Menu Item / {DEFAULT|DESTRUCTIVE} / {DEFAULT|DISABLED} / {SM|MD|LG}`.
 *
 * The item keeps its own 1px border in the design file — it is drawn standalone
 * in the component matrix — and the menu simply stacks instances with a 4px gap.
 * Item size follows the menu ("참조하는 메뉴의 사이즈를 따름"), so `Menu` passes its
 * `size` down through context-free explicit props on the caller's side.
 */
import { Icon } from './Icon';
import { cn } from './cn';

export type MenuItemType = 'default' | 'destructive';
export type MenuItemState = 'default' | 'disabled';
export type MenuItemSize = 'sm' | 'md' | 'lg';

const HEIGHT: Record<MenuItemSize, string> = { sm: 'h-8', md: 'h-10', lg: 'h-12' };
const ICON_SIZE: Record<MenuItemSize, 16 | 20> = { sm: 16, md: 20, lg: 20 };

export interface MenuItemProps
  // `type` is the design axis (default / destructive), so the native button
  // `type` attribute is dropped — the element always renders `type="button"`.
  extends Omit<React.ComponentPropsWithoutRef<'button'>, 'children' | 'type'> {
  label: string;
  type?: MenuItemType;
  state?: MenuItemState;
  size?: MenuItemSize;
  leadingIcon?: string;
}

export function MenuItem({
  label,
  type = 'default',
  state = 'default',
  size = 'md',
  leadingIcon,
  className,
  ...rest
}: MenuItemProps) {
  const disabled = state === 'disabled';

  return (
    <button
      type="button"
      role="menuitem"
      disabled={disabled}
      className={cn(
        'flex w-full items-center gap-2 rounded-md border px-3 text-left',
        'focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-border-focus',
        HEIGHT[size],
        // DISABLED overrides the type colours entirely, as in the design file.
        disabled
          ? 'bg-background-disabled border-border-disabled text-text-disabled'
          : type === 'destructive'
            ? 'bg-background-surface border-border-error text-text-error'
            : 'bg-background-surface border-border-default text-text-default',
        className,
      )}
      {...rest}
    >
      {leadingIcon && <Icon name={leadingIcon} size={ICON_SIZE[size]} />}
      <span className="type-body-lg">{label}</span>
    </button>
  );
}

export interface MenuProps extends React.ComponentPropsWithoutRef<'div'> {
  /** Accessible name for the menu surface. */
  label: string;
}

export function Menu({ label, className, children, ...rest }: MenuProps) {
  return (
    <div
      role="menu"
      aria-label={label}
      className={cn(
        'flex w-[280px] flex-col gap-1 rounded-lg border border-border-default bg-background-surface p-1',
        // `.pen` uses a raw `#0000001A` here; mapped to the semantic shadow token
        // for floating navigation surfaces. See the deviations table.
        'shadow-[0_4px_12px_var(--color-shadow-navigation)]',
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
