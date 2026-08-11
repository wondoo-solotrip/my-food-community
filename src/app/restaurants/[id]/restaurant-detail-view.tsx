'use client';

/**
 * 02 Detail Page — design.pen `02 Detail Page`.
 *
 * The hero keeps the .pen photo treatment (full-height gradient shade plus a
 * bottom dim layer, counter pill, overlay title with the two brand marks). The
 * story prose is capped at a readable 720px column on wider screens.
 *
 * 데이터는 `GET /api/places/[id]`(BFF)에서 온다. 본인 글이면 상단 트레일링이
 * 수정 진입으로 바뀐다. Storybook은 `initialPlace`로 데이터를 주입한다.
 */
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { AddressRow, EmptyState, NaverMap, NaverMapBadge, Skeleton } from '@/components';
import { ADDRESS_PENDING, type PlaceDetail } from '@/lib/places';

import { AppTopNav } from '../../_components/app-top-nav';

/** `.pen` Full Photo Gradient Shade — 5-stop light-to-dark wash over the photo. */
const HERO_SHADE =
  'bg-[linear-gradient(to_bottom,var(--color-overlay-light-medium)_0%,var(--color-overlay-light-subtle)_26%,var(--color-overlay-dark-subtle)_50%,var(--color-overlay-dark-strong)_78%,var(--color-overlay-dark-max)_100%)]';

/** `.pen` Bottom Dim Overlay — extra 160px scrim behind the title. */
const HERO_DIM =
  'bg-[linear-gradient(to_bottom,var(--color-overlay-transparent)_0%,var(--color-overlay-dark-medium)_45%,var(--color-overlay-dark-heavy)_100%)]';

/**
 * `.pen` 10 — 사진 아래 위치 섹션. DB에 저장된 지도 정보(좌표·지번 주소)가
 * 있으면 그 좌표를 중심으로 한 네이버 미니 실지도에 마커(핀 라벨은 장소명)를
 * 올리고 주소 행을 붙인다. 지도 연동 전 글은 좌표가 없어 목업 지도(주소만
 * 있는 글)나 장소명 행(장소명만 있는 글)으로 폴백하고, 장소 정보가 아예 없는
 * 글은 섹션 자체를 그리지 않는다.
 */
function LocationSection({ place }: { place: PlaceDetail }) {
  const hasAddress = place.address !== '' && place.address !== ADDRESS_PENDING;
  if (!hasAddress && !place.placeName) return null;

  // DB `lat`/`lng` — 좌표가 있어야 실지도를 그린다.
  const coord =
    place.lat !== null && place.lng !== null
      ? { lat: place.lat, lng: place.lng }
      : undefined;

  return (
    <section
      aria-label="위치"
      className="mx-auto flex w-full max-w-[720px] flex-col gap-3 px-5 pt-4"
    >
      <div className="flex items-center justify-between">
        <h2 className="type-heading-md text-text-strong">위치</h2>
        <NaverMapBadge tone="subtle" />
      </div>
      {hasAddress && (
        <NaverMap
          variant="mini"
          center={coord}
          pinLabel={place.placeName ?? place.title}
        />
      )}
      <AddressRow text={hasAddress ? place.address : (place.placeName ?? '')} />
    </section>
  );
}

export interface RestaurantDetailViewProps {
  id: string;
  /** Storybook 등 API가 없는 환경에서 상세를 주입한다. 앱에서는 생략. */
  initialPlace?: PlaceDetail;
}

export function RestaurantDetailView({ id, initialPlace }: RestaurantDetailViewProps) {
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
        title="맛집 상세"
        backHref="/"
        trailing={
          place?.isOwner
            ? { icon: 'edit', label: '수정', href: `/restaurants/${id}/edit` }
            : { icon: 'search', label: '검색', href: '/' }
        }
      />

      <main className="flex w-full flex-1 flex-col">
        {place === undefined ? (
          <>
            <Skeleton variant="rectangle" width="100%" height={452} className="rounded-none" />
            <div className="mx-auto flex w-full max-w-[720px] flex-col gap-6 px-5 pt-8 pb-6">
              <Skeleton variant="text" lines={3} width="100%" />
            </div>
          </>
        ) : place === null ? (
          <EmptyState
            visual="search"
            title="맛집을 찾을 수 없어요"
            description="삭제됐거나 주소가 잘못된 것 같아요."
            primaryAction={{ label: '홈으로 가기', onClick: () => router.push('/') }}
            className="flex-1"
          />
        ) : (
          <>
            <section className="relative h-[452px] w-full overflow-hidden md:h-[520px]">
              {place.imageUrls[0] && (
                <Image
                  src={place.imageUrls[0]}
                  alt={`${place.title} 대표 사진`}
                  fill
                  preload
                  sizes="(min-width: 1280px) 1280px, 100vw"
                  className="object-cover"
                />
              )}
              <div aria-hidden className={`absolute inset-0 ${HERO_SHADE}`} />
              <div aria-hidden className={`absolute inset-x-0 bottom-0 h-40 ${HERO_DIM}`} />

              <span className="absolute top-[18px] right-5 rounded-full bg-overlay-dark-50 px-[9px] py-[5px]">
                <span className="type-label-md text-text-on-image">
                  1/{place.imageUrls.length}
                </span>
              </span>

              <div className="absolute inset-x-5 bottom-[46px] flex flex-col gap-3">
                <h1 className="type-heading-lg text-text-on-image">{place.title}</h1>
                <div className="flex items-center gap-2" aria-hidden>
                  <span className="h-[5px] w-[70px] rounded-full bg-background-brand-accent" />
                  <span className="h-[5px] w-9 rounded-full bg-overlay-light-strong" />
                </div>
              </div>
            </section>

            <LocationSection place={place} />

            <section className="mx-auto flex w-full max-w-[720px] flex-col gap-6 px-5 pt-8 pb-6">
              <h2 className="type-heading-md text-text-strong">왜 숨은 맛집인가요?</h2>
              <p className="type-body-lg text-text-body">{place.content}</p>
            </section>
          </>
        )}
      </main>
    </div>
  );
}
