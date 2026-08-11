/**
 * Navigation — `.pen`: `Top Navigation / Default`, `Bottom Navigation / Default`,
 * `Tab Navigation / Default`.
 *
 * All three are single-variant components ("타입: 없음, 상태: 없음"); what varies is
 * the item list and which item is active, so those are props rather than
 * separate components.
 */
import { Icon } from './Icon';
import { IconButton } from './IconButton';
import { cn } from './cn';

/* -- Top Navigation -------------------------------------------------------- */

export interface TopNavigationProps extends React.ComponentPropsWithoutRef<'header'> {
  title: string;
  /** Both side slots are optional per the guide. */
  leading?: { icon: string; label: string; onClick?: () => void };
  trailing?: { icon: string; label: string; onClick?: () => void };
}

export function TopNavigation({
  title,
  leading,
  trailing,
  className,
  ...rest
}: TopNavigationProps) {
  return (
    <header
      className={cn(
        'flex h-14 w-full items-center justify-between border-b border-border-default bg-background-surface px-2',
        className,
      )}
      {...rest}
    >
      {/* `.pen` sizes both side buttons at 40 with a 24px glyph. When a slot is
          empty a spacer takes its place, so the title stays optically centred. */}
      {leading ? (
        <IconButton icon={leading.icon} label={leading.label} size={40} onClick={leading.onClick} />
      ) : (
        <span className="size-10 shrink-0" />
      )}

      <h1 className="type-heading-sm min-w-0 flex-1 truncate text-center text-text-default">
        {title}
      </h1>

      {trailing ? (
        <IconButton
          icon={trailing.icon}
          label={trailing.label}
          size={40}
          onClick={trailing.onClick}
        />
      ) : (
        <span className="size-10 shrink-0" />
      )}
    </header>
  );
}

/* -- Bottom Navigation ----------------------------------------------------- */

export interface BottomNavigationItem {
  icon: string;
  label: string;
}

export interface BottomNavigationProps
  // Native `onSelect` is a text-selection handler; ours reports the tapped item.
  extends Omit<React.ComponentPropsWithoutRef<'nav'>, 'onSelect'> {
  /** Guide: 2–5 items, distributed evenly. */
  items: BottomNavigationItem[];
  activeIndex?: number;
  showLabels?: boolean;
  onSelect?: (index: number) => void;
}

export function BottomNavigation({
  items,
  activeIndex = 0,
  showLabels = true,
  onSelect,
  className,
  ...rest
}: BottomNavigationProps) {
  return (
    <nav
      className={cn(
        'flex h-14 w-full border-t border-border-default bg-background-surface',
        className,
      )}
      {...rest}
    >
      {items.map((item, index) => {
        const active = index === activeIndex;
        return (
          <button
            key={item.label}
            type="button"
            aria-current={active ? 'page' : undefined}
            onClick={() => onSelect?.(index)}
            className={cn(
              'flex flex-1 flex-col items-center justify-center gap-0.5',
              'focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-border-focus',
              active ? 'text-text-brand' : 'text-text-secondary',
            )}
          >
            <Icon name={item.icon} size={24} />
            {showLabels && <span className="type-label-md">{item.label}</span>}
            {!showLabels && <span className="sr-only">{item.label}</span>}
          </button>
        );
      })}
    </nav>
  );
}

/* -- Tab Navigation -------------------------------------------------------- */

export interface TabNavigationProps
  extends Omit<React.ComponentPropsWithoutRef<'div'>, 'onSelect'> {
  /** Guide: 2 or more, distributed evenly. */
  tabs: string[];
  activeIndex?: number;
  onSelect?: (index: number) => void;
}

export function TabNavigation({
  tabs,
  activeIndex = 0,
  onSelect,
  className,
  ...rest
}: TabNavigationProps) {
  return (
    <div
      role="tablist"
      className={cn(
        'flex h-12 w-full border-b border-border-default bg-background-surface',
        className,
      )}
      {...rest}
    >
      {tabs.map((tab, index) => {
        const active = index === activeIndex;
        return (
          <button
            key={tab}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onSelect?.(index)}
            className={cn(
              'flex flex-1 flex-col',
              'focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-border-focus',
            )}
          >
            <span
              className={cn(
                'type-label-lg flex flex-1 items-center justify-center',
                active ? 'text-text-brand' : 'text-text-secondary',
              )}
            >
              {tab}
            </span>
            {/* The unselected indicator stays in the flow as a transparent bar,
                so the label never shifts by 2px on selection. */}
            <span
              className={cn(
                'h-0.5 w-full',
                active ? 'bg-background-brand' : 'bg-background-transparent',
              )}
            />
          </button>
        );
      })}
    </div>
  );
}
