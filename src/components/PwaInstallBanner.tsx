/**
 * PwaInstallBanner — 화면 하단에 붙는 앱 설치 유도 띠배너.
 *
 * 요구사항에 따라 기존 컴포넌트를 재사용하지 않고 토큰만으로 새로 그린 전용
 * UI다. 띠 전체가 설치 트리거이고, 오른쪽 닫기 버튼만 배너를 숨긴다.
 * 아이콘 이미지는 scripts/generate-pwa-assets.mjs가 만든 manifest 아이콘을 쓴다.
 *
 * 설치 동작(안드로이드 beforeinstallprompt / iOS 가이드 바텀시트)은
 * `src/app/_components/pwa-install-banner.tsx`가 연결한다.
 */
import Image from 'next/image';

import { cn } from './cn';

export interface PwaInstallBannerProps extends React.ComponentPropsWithoutRef<'div'> {
  /** 배너에 표시할 앱 이름. */
  appName?: string;
  /** 앱 이름 아래 한 줄 설명. */
  description?: string;
  /** 오른쪽 설치 칩의 라벨. iOS에서는 가이드를 여는 문구로 바꾼다. */
  ctaLabel?: string;
  /** 띠(아이콘·텍스트·칩 어디든) 클릭 시 호출. */
  onInstall?: () => void;
  /** 닫기(✕) 버튼 클릭 시 호출. */
  onDismiss?: () => void;
  /** `fixed`는 앱용, `static`은 스토리북 프리뷰용. */
  position?: 'fixed' | 'static';
}

export function PwaInstallBanner({
  appName = '구로 맛집 지도',
  description = '홈 화면에 추가해 앱처럼 쓰세요',
  ctaLabel = '설치',
  onInstall,
  onDismiss,
  position = 'fixed',
  className,
  ...rest
}: PwaInstallBannerProps) {
  return (
    <div
      className={cn(
        'inset-x-0 bottom-0 z-50 bg-background-inverse',
        position === 'fixed' ? 'fixed' : 'relative',
        className,
      )}
      {...rest}
    >
      <div
        className={cn(
          'mx-auto flex w-full max-w-[1280px] items-center py-2.5 pl-4 pr-1',
          // 홈 인디케이터가 있는 기기에서 띠가 제스처 영역을 침범하지 않게 한다.
          'pb-[max(0.625rem,env(safe-area-inset-bottom))]',
        )}
      >
        <button
          type="button"
          onClick={onInstall}
          className={cn(
            'flex min-w-0 flex-1 items-center gap-3 text-left',
            'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus',
          )}
        >
          <Image
            src="/icons/icon-maskable-192.png"
            alt=""
            width={40}
            height={40}
            className="size-10 shrink-0 rounded-[10px]"
          />
          <span className="flex min-w-0 flex-1 flex-col">
            <span className="type-label-lg truncate text-text-inverse">{appName}</span>
            <span className="type-body-md truncate text-neutral-300">{description}</span>
          </span>
          <span
            className={cn(
              'shrink-0 rounded-full bg-background-brand px-4 py-2',
              'type-label-md whitespace-nowrap text-text-on-brand',
            )}
          >
            {ctaLabel}
          </span>
        </button>

        <button
          type="button"
          aria-label="설치 배너 닫기"
          onClick={onDismiss}
          className={cn(
            'shrink-0 p-2.5 text-neutral-400 hover:text-text-inverse',
            'focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-border-focus',
          )}
        >
          <svg
            width={20}
            height={20}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            aria-hidden="true"
          >
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}

/** iOS 공유 아이콘(위로 향한 화살표가 있는 상자). 가이드 문구 안에서만 쓴다. */
function IosShareGlyph() {
  return (
    <svg
      width={16}
      height={16}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-label="공유"
      role="img"
      className="inline-block align-[-2px] text-text-brand"
    >
      <path d="M12 3v12" />
      <path d="m8 7 4-4 4 4" />
      <path d="M4 11v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
    </svg>
  );
}

const IOS_GUIDE_STEPS: React.ReactNode[] = [
  <>
    Safari 하단 도구 막대에서 공유 <IosShareGlyph /> 버튼을 탭하세요
  </>,
  <>
    목록에서 <strong className="type-label-md text-text-default">홈 화면에 추가</strong>를
    선택하세요
  </>,
  <>
    오른쪽 위 <strong className="type-label-md text-text-default">추가</strong>를 탭하면 설치가
    끝나요
  </>,
];

/**
 * iOS 설치 안내 단계 목록. 앱에서는 `BottomSheet` 안에 담아 띄운다.
 * (iOS Safari는 설치 프롬프트 API가 없어 수동 안내가 필요하다.)
 */
export function PwaInstallIosGuide() {
  return (
    <ol className="flex w-full flex-col gap-3">
      {IOS_GUIDE_STEPS.map((step, index) => (
        <li key={index} className="flex items-start gap-3">
          <span
            aria-hidden="true"
            className={cn(
              'flex size-6 shrink-0 items-center justify-center rounded-full',
              'type-label-md bg-background-brand-subtle text-text-brand',
            )}
          >
            {index + 1}
          </span>
          <p className="type-body-md min-w-0 flex-1 pt-0.5 text-text-body">{step}</p>
        </li>
      ))}
    </ol>
  );
}
