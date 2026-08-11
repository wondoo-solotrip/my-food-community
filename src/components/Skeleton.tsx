/**
 * Skeleton — `.pen`: `Skeleton / {Text | Rectangle | Circle}`.
 *
 * All three are `color-background-disabled` blocks; only the geometry differs, and
 * per the guide that geometry comes from whatever element is being stood in for.
 * The defaults below are the sizes the design file happens to draw.
 */
import { cn } from './cn';

export type SkeletonVariant = 'text' | 'rectangle' | 'circle';

/** `.pen` staggers the three text lines so the block reads as a paragraph. */
const TEXT_LINE_WIDTHS = ['100%', 220, 160];

export interface SkeletonProps extends React.ComponentPropsWithoutRef<'div'> {
  variant?: SkeletonVariant;
  /** `text`: number of lines. Widths repeat the design file's 100% / 220 / 160. */
  lines?: number;
  width?: number | string;
  height?: number | string;
  /** `circle`: diameter. */
  size?: number;
}

export function Skeleton({
  variant = 'text',
  lines = 3,
  width,
  height,
  size = 64,
  className,
  style,
  ...rest
}: SkeletonProps) {
  if (variant === 'text') {
    return (
      <div
        className={cn('flex flex-col gap-2', className)}
        style={{ width: width ?? 280, ...style }}
        aria-hidden="true"
        {...rest}
      >
        {Array.from({ length: lines }, (_, i) => (
          <div
            key={i}
            className="h-4 rounded-sm bg-background-disabled"
            style={{ width: TEXT_LINE_WIDTHS[i % TEXT_LINE_WIDTHS.length] }}
          />
        ))}
      </div>
    );
  }

  if (variant === 'circle') {
    return (
      <div
        className={cn('rounded-full bg-background-disabled', className)}
        style={{ width: size, height: size, ...style }}
        aria-hidden="true"
        {...rest}
      />
    );
  }

  return (
    <div
      className={cn('rounded-xl bg-background-disabled', className)}
      style={{ width: width ?? 280, height: height ?? 120, ...style }}
      aria-hidden="true"
      {...rest}
    />
  );
}
