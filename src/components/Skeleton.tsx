/**
 * Skeleton — `.pen`: `Skeleton / {Text | Rectangle | Circle}`.
 *
 * All three are `color-background-skeleton` blocks(.pen의 disabled 웜 그레이는
 * 큰 면적에서 베이지로 읽혀 스켈레톤만 쿨 그레이 전용 토큰을 쓴다); only the
 * geometry differs, and per the guide that geometry comes from whatever element
 * is being stood in for. The defaults below are the sizes the design file draws.
 *
 * 정적인 단색 블록 위로 흰 빛줄기가 좌상→우하로 지나가는 shimmer
 * (`skeleton-shimmer`, globals.css)를 얹는다 — 모션 최소화 설정에서는 꺼진다.
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
        className={cn('flex shrink-0 flex-col gap-2', className)}
        style={{ width: width ?? 280, ...style }}
        aria-hidden="true"
        {...rest}
      >
        {Array.from({ length: lines }, (_, i) => (
          <div
            key={i}
            className="skeleton-shimmer h-4 rounded-sm bg-background-skeleton"
            style={{ width: TEXT_LINE_WIDTHS[i % TEXT_LINE_WIDTHS.length] }}
          />
        ))}
      </div>
    );
  }

  if (variant === 'circle') {
    return (
      <div
        className={cn('skeleton-shimmer shrink-0 rounded-full bg-background-skeleton', className)}
        style={{ width: size, height: size, ...style }}
        aria-hidden="true"
        {...rest}
      />
    );
  }

  return (
    <div
      // 스탠드인은 스크롤 컨테이너(flex) 안에서도 절대 짜부라지면 안 된다.
      className={cn('skeleton-shimmer shrink-0 rounded-xl bg-background-skeleton', className)}
      style={{ width: width ?? 280, height: height ?? 120, ...style }}
      aria-hidden="true"
      {...rest}
    />
  );
}
