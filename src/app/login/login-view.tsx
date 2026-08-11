'use client';

/**
 * 04 Login Page — design.pen `04 Login Page`.
 *
 * A single centred column: brand mark, headline copy and trust pill on top,
 * the Google button and terms note pinned to the bottom. The column stays at
 * 420px past mobile so the display type keeps its designed line breaks.
 */
import { Button, Icon } from '@/components';

export function LoginView() {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[1280px] flex-col">
      <main className="mx-auto flex w-full max-w-[420px] flex-1 flex-col items-center justify-between px-6 pt-14 pb-8">
        <div className="flex w-full flex-col items-center gap-6">
          <span className="flex size-24 items-center justify-center rounded-full border border-border-brand bg-background-brand-subtle">
            <span className="flex size-16 items-center justify-center rounded-full bg-background-brand text-text-on-brand">
              <Icon name="image" size={32} />
            </span>
          </span>

          <div className="flex w-full flex-col items-center gap-3">
            <p className="type-label-lg text-text-brand">구로 맛집 지도</p>
            <h1 className="type-display-md text-center whitespace-pre-line text-text-strong">
              {'이번 주말,\n진짜 맛집으로 출발해요'}
            </h1>
            <p className="type-body-lg text-center whitespace-pre-line text-text-secondary">
              {'구로 이웃이 직접 다녀온 숨은 맛집을\n사진과 지도로 만나보세요.'}
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-full border border-border-default bg-background-surface px-3 py-2">
            <span className="text-text-brand">
              <Icon name="check" size={20} />
            </span>
            <span className="type-label-md text-text-secondary">광고 없이, 직접 다녀온 후기만</span>
          </div>
        </div>

        <div className="flex w-full flex-col items-center gap-4">
          <Button
            variant="secondary"
            size="lg"
            className="w-full"
            onClick={() => window.location.assign('/api/auth/login')}
          >
            <span aria-hidden className="text-xl font-bold">
              G
            </span>
            Google로 시작하기
          </Button>
          <p className="type-label-md text-center text-text-subtle">
            계속하면 이용약관과 개인정보처리방침에 동의하게 됩니다.
          </p>
        </div>
      </main>
    </div>
  );
}
