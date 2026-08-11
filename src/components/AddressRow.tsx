/**
 * AddressRow — `.pen`: `등록 장소 주소 / 페이지 직접 구성`(07 장소 등록)과
 * `상세 주소 / 페이지 직접 구성`(10 맛집 상세)이 공유하는 주소 행.
 *
 * 36px 브랜드 연한 원 안의 홈 아이콘 + 주소 텍스트. 두 화면의 차이는 텍스트
 * 색뿐이라 `tone`으로 가른다: 장소 등록은 `secondary`, 상세는 `default`.
 */
import { Icon } from './Icon';
import { cn } from './cn';

export interface AddressRowProps {
  text: string;
  tone?: 'default' | 'secondary';
  className?: string;
}

export function AddressRow({ text, tone = 'default', className }: AddressRowProps) {
  return (
    <div className={cn('flex w-full items-center gap-2', className)}>
      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-background-brand-subtle">
        <Icon name="home" size={20} className="text-text-brand" />
      </span>
      <p
        className={cn(
          'type-body-md min-w-0 flex-1',
          tone === 'default' ? 'text-text-default' : 'text-text-secondary',
        )}
      >
        {text}
      </p>
    </div>
  );
}
