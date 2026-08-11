/**
 * IconButton — `.pen`: `Icon Button / {Ghost | Brand Circle | Neutral Circle} / 48`.
 *
 * All three are 48×48 pills whose only difference is the background token and
 * the icon's `text-*` token. `.pen` defines no disabled or hover state for icon
 * buttons, and the guide marks them "수정 금지", so none is invented here.
 *
 * `size` exists because the .pen *instances* resize the 48 component: the top
 * navigation uses 40, the modal close and file-item delete use 32.
 */
import { Icon } from './Icon';
import { cn } from './cn';

export type IconButtonVariant = 'ghost' | 'brand' | 'neutral';
export type IconButtonSize = 32 | 40 | 48;

const VARIANT: Record<IconButtonVariant, string> = {
  ghost: 'text-text-default',
  brand: 'bg-background-brand text-text-on-brand',
  neutral: 'bg-background-inverse text-text-inverse',
};

const BOX: Record<IconButtonSize, string> = {
  32: 'size-8',
  40: 'size-10',
  48: 'size-12',
};

/** Icon size each instance size carries in the .pen file. */
const DEFAULT_ICON: Record<IconButtonSize, number> = { 32: 16, 40: 24, 48: 24 };

export interface IconButtonProps
  extends Omit<React.ComponentPropsWithoutRef<'button'>, 'children'> {
  icon: string;
  /** Accessible name — an icon-only control has no text, so this is required. */
  label: string;
  variant?: IconButtonVariant;
  size?: IconButtonSize;
  /** Override the icon size the box would pick on its own. */
  iconSize?: number;
}

export function IconButton({
  icon,
  label,
  variant = 'ghost',
  size = 48,
  iconSize,
  className,
  type = 'button',
  ...rest
}: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      className={cn(
        'inline-flex items-center justify-center rounded-full',
        // Focus ring is a code-layer addition: keyboard users need it and the
        // design system already owns the token for it.
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus',
        BOX[size],
        VARIANT[variant],
        className,
      )}
      {...rest}
    >
      <Icon name={icon} size={iconSize ?? DEFAULT_ICON[size]} />
    </button>
  );
}
