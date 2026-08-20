/**
 * AddressRow — `.pen`: `등록 장소 주소 / 페이지 직접 구성`(07 장소 등록)과
 * `상세 주소 / 페이지 직접 구성`(10 맛집 상세)이 공유하는 주소 행.
 *
 * 원래 .pen은 36px 브랜드 연한 원 안의 홈 아이콘이었지만, 플랫한 방향으로
 * 정리하며(제품 결정) 배경 없이 최소 크기(16) 아이콘을 뉴트럴톤으로 쓴다.
 * 두 화면의 차이는 텍스트 색뿐이라 `tone`으로 가른다.
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
    <div className={cn('flex w-full items-center gap-1.5', className)}>
      <Icon name="home" size={16} className="shrink-0 text-text-subtle" />
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
