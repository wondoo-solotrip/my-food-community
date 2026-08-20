/**
 * Badge — `.pen`: `Badge / {NEUTRAL|SUCCESS|ERROR|INFO|WARNING} / {MD|LG}`.
 *
 * NEUTRAL is the odd one out: it is a solid dark pill, so the design file sets
 * its border to the *same* token as its fill. The four status types are outlined
 * pills on the card surface instead. Both sizes use 8px horizontal padding — only
 * the height changes.
 */
import { cn } from './cn';

export type BadgeType = 'neutral' | 'success' | 'error' | 'info' | 'warning';
export type BadgeSize = 'md' | 'lg';

const TYPE: Record<BadgeType, string> = {
  neutral: 'bg-background-inverse border-background-inverse text-text-inverse',
  success: 'bg-background-surface border-border-success text-text-success',
  error: 'bg-background-surface border-border-error text-text-error',
  info: 'bg-background-surface border-border-information text-text-information',
  warning: 'bg-background-surface border-border-warning text-text-warning',
};

/** `filled` — 외곽선 대신 DS 팔레트의 상태색 솔리드(600 스텝) + inverse 텍스트로
    채운 변형. 외곽선 버튼(예: 결제 취소) 옆에서 배지가 버튼처럼 읽히는 것을 막는다.
    역상 12px 텍스트는 Regular로는 가늘어 보여 semibold로 보정한다(외곽선은 규격대로 Regular). */
const TYPE_FILLED: Record<BadgeType, string> = {
  neutral: 'bg-background-inverse border-transparent text-text-inverse font-semibold',
  success: 'bg-teal-600 border-transparent text-text-inverse font-semibold',
  error: 'bg-red-600 border-transparent text-text-inverse font-semibold',
  info: 'bg-blue-600 border-transparent text-text-inverse font-semibold',
  warning: 'bg-amber-600 border-transparent text-text-inverse font-semibold',
};

const SIZE: Record<BadgeSize, string> = { md: 'h-5', lg: 'h-6' };

export interface BadgeProps extends React.ComponentPropsWithoutRef<'span'> {
  label: string;
  type?: BadgeType;
  size?: BadgeSize;
  /** 외곽선 대신 상태색 배경으로 채운다. Default false. */
  filled?: boolean;
}

export function Badge({
  label,
  type = 'neutral',
  size = 'md',
  filled = false,
  className,
  ...rest
}: BadgeProps) {
  return (
    <span
      className={cn(
        'type-label-md inline-flex items-center justify-center rounded-full border px-2',
        SIZE[size],
        filled ? TYPE_FILLED[type] : TYPE[type],
        className,
      )}
      {...rest}
    >
      {label}
    </span>
  );
}
