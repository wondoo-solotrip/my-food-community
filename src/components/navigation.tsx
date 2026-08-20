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
  /** 트레일링 슬롯에 아이콘 버튼 대신 그대로 놓는 커스텀 노드 — `trailing`보다 우선한다. */
  trailingContent?: React.ReactNode;
}

export function TopNavigation({
  title,
  leading,
  trailing,
  trailingContent,
  className,
  ...rest
}: TopNavigationProps) {
  return (
    <header
      className={cn(
        // shrink-0: 앱 셸(flex column) 안에서 56px 높이가 찌그러지지 않는다.
        'flex h-14 w-full shrink-0 items-center justify-between border-b border-border-default bg-background-surface px-2',
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

      {trailingContent ??
        (trailing ? (
          <IconButton
            icon={trailing.icon}
            label={trailing.label}
            size={40}
            onClick={trailing.onClick}
          />
        ) : (
          <span className="size-10 shrink-0" />
        ))}
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
  // 2개짜리 바는 5등분 그리드의 2·4번째 슬롯에 놓는다(없·있·없·있·없) —
  // 25%/75%로 양끝에 밀리는 대신 30%/70%에 모여 무게중심이 안정된다.
  const twoItems = items.length === 2;

  return (
    <nav
      className={cn(
        'flex h-14 w-full border-t border-border-default bg-background-surface',
        twoItems && 'justify-center gap-[20%]',
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
              'flex flex-col items-center justify-center gap-0.5',
              twoItems ? 'w-1/5 flex-none' : 'flex-1',
              'focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-border-focus',
              active ? 'text-text-brand' : 'text-text-secondary',
            )}
          >
            {/* 아이콘은 한 치수 낮춘 20. 선택된 라벨은 12px에서도 또렷하게
                차이 나도록 bold(700)로 강조한다. */}
            <Icon name={item.icon} size={20} />
            {showLabels && (
              <span className={cn('type-label-md', active && 'font-bold')}>{item.label}</span>
            )}
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
        // shrink-0: 스크롤 컨테이너(flex column) 안에서 컨텐츠가 길어져도
        // 48px 높이가 찌그러지지 않는다.
        'flex h-12 w-full shrink-0 border-b border-border-default bg-background-surface',
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
