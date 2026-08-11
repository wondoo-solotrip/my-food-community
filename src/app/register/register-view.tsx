'use client';

/**
 * 03 Register Page — design.pen `03 Register Page`.
 *
 * 폼 영역은 공용 `PlaceForm`이 담당하고 `POST /api/places`(BFF)로 저장한다.
 * 폼 컬럼은 해상도 가이드대로 640px에서 캡한다.
 */
import { AppTopNav } from '../_components/app-top-nav';
import { PlaceForm } from '../_components/place-form';

export function RegisterView() {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[1280px] flex-col">
      <AppTopNav
        title="맛집 등록"
        backHref="/"
        trailing={{ icon: 'close', label: '닫기', href: '/' }}
      />

      <main className="mx-auto flex w-full max-w-[640px] flex-1 flex-col gap-5 px-4 pt-2 pb-6 md:pt-6">
        <PlaceForm />
      </main>
    </div>
  );
}
