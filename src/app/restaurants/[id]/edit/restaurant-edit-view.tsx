'use client';

/**
 * 맛집 수정 — 등록과 같은 `PlaceForm`을 기존 값으로 채워 `PUT /api/places/[id]`
 * (BFF)로 저장한다. 본인 글이 아니면 폼 대신 안내를 보여준다.
 */
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { EmptyState, Skeleton } from '@/components';
import type { PlaceDetail } from '@/lib/places';

import { AppTopNav } from '../../../_components/app-top-nav';
import { PlaceForm } from '../../../_components/place-form';

export interface RestaurantEditViewProps {
  id: string;
  /** Storybook 등 API가 없는 환경에서 상세를 주입한다. 앱에서는 생략. */
  initialPlace?: PlaceDetail;
}

export function RestaurantEditView({ id, initialPlace }: RestaurantEditViewProps) {
  const router = useRouter();
  // undefined면 로딩 중, null이면 찾지 못한 것.
  const [place, setPlace] = useState<PlaceDetail | null | undefined>(initialPlace);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/places/${id}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (cancelled) return;
        if (data?.place) setPlace(data.place);
        else setPlace((prev) => prev ?? null);
      })
      .catch(() => {
        // API가 없는 환경(Storybook)에서는 주입된 상세를 유지한다.
        if (!cancelled) setPlace((prev) => (prev === undefined ? null : prev));
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[1280px] flex-col">
      <AppTopNav
        title="맛집 수정"
        backHref={`/restaurants/${id}`}
        trailing={{ icon: 'close', label: '닫기', href: `/restaurants/${id}` }}
      />

      <main className="mx-auto flex w-full max-w-[640px] flex-1 flex-col gap-5 px-4 pt-2 pb-6 md:pt-6">
        {place === undefined ? (
          <div className="flex flex-col gap-5 pt-2">
            <Skeleton variant="rectangle" width="100%" height={132} />
            <Skeleton variant="rectangle" width="100%" height={76} />
            <Skeleton variant="rectangle" width="100%" height={120} />
          </div>
        ) : place === null ? (
          <EmptyState
            visual="search"
            title="맛집을 찾을 수 없어요"
            description="삭제됐거나 주소가 잘못된 것 같아요."
            primaryAction={{ label: '홈으로 가기', onClick: () => router.push('/') }}
            className="flex-1"
          />
        ) : !place.isOwner ? (
          <EmptyState
            visual="error"
            title="수정 권한이 없어요"
            description="본인이 등록한 맛집만 수정할 수 있어요."
            primaryAction={{
              label: '상세로 돌아가기',
              onClick: () => router.push(`/restaurants/${id}`),
            }}
            className="flex-1"
          />
        ) : (
          <PlaceForm
            place={{
              id: place.id,
              title: place.title,
              content: place.content,
              imageUrls: place.imageUrls,
              placeName: place.placeName,
              address: place.address,
              lat: place.lat,
              lng: place.lng,
            }}
          />
        )}
      </main>
    </div>
  );
}
