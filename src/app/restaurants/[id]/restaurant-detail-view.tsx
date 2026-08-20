'use client';

/**
 * 02 Detail Page — design.pen `02 Detail Page`.
 *
 * The hero keeps the .pen photo treatment (full-height gradient shade plus a
 * bottom dim layer, counter pill, overlay title with the two brand marks).
 * 데스크톱에서도 사진·지도가 모바일 비율을 유지하도록, 등록 페이지처럼 본문
 * 전체를 640px 칼럼으로 중앙 정렬한다.
 *
 * 데이터는 `GET /api/places/[id]`(BFF)에서 온다. 본인 글이면 상단 트레일링이
 * 수정 진입으로 바뀐다. Storybook은 `initialPlace`로 데이터를 주입한다.
 */
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { AddressRow, EmptyState, NaverMap, Skeleton } from '@/components';
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
 * 있으면 그 좌표를 중심으로 한 네이버 미니 실지도에 마커를
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
      className="mx-auto flex w-full max-w-[640px] flex-col gap-3 px-5 pt-4"
    >
      <h2 className="type-heading-md text-text-strong">위치</h2>
      {hasAddress && (
        <NaverMap variant="mini" center={coord} pin />
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
  // 히어로 캐러셀에서 지금 보이는 사진 번호 — 카운터·인디케이터가 따라간다.
  const [photoIndex, setPhotoIndex] = useState(0);

  const handleHeroScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const el = event.currentTarget;
    setPhotoIndex(Math.round(el.scrollLeft / el.clientWidth));
  };

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
    // 앱 셸: 문서 스크롤 없이 본문(main)만 스크롤한다 — 상단 내비게이션은 고정.
    <div className="mx-auto flex h-dvh w-full max-w-[1280px] flex-col overflow-hidden">
      <AppTopNav
        title="맛집 상세"
        backHref="/"
        trailing={
          place?.isOwner
            ? { icon: 'edit', label: '수정', href: `/restaurants/${id}/edit` }
            : { icon: 'search', label: '검색', href: '/' }
        }
      />

      <main className="scrollbar-hidden flex w-full flex-1 flex-col overflow-y-auto overscroll-contain">
        {place === undefined ? (
          <>
            <div className="mx-auto w-full max-w-[640px]">
              <Skeleton
                variant="rectangle"
                width="100%"
                height="auto"
                className="aspect-[5/6] rounded-none"
              />
            </div>
            {/* 위치 섹션과 같은 구도: 제목 → 미니 지도(15:8 비율) → 주소 한 줄. */}
            <div className="mx-auto flex w-full max-w-[640px] flex-col gap-3 px-5 pt-4">
              <Skeleton variant="rectangle" width={64} height={20} className="rounded-sm" />
              <Skeleton
                variant="rectangle"
                width="100%"
                height="auto"
                className="aspect-[15/8] rounded-xl"
              />
              <Skeleton variant="rectangle" width="60%" height={14} className="rounded-sm" />
            </div>
            <div className="mx-auto flex w-full max-w-[640px] flex-col gap-6 px-5 pt-12 pb-6">
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
            {/* 고정 높이 대신 모바일 구도(375×452 ≈ 5:6)의 비율 고정 — 등록 페이지
                처럼 640px 칼럼에 담아 데스크톱에서도 같은 비율로 보인다. */}
            <section className="relative mx-auto aspect-[5/6] w-full max-w-[640px] shrink-0 overflow-hidden">
              {/* 사진이 여러 장이면 좌우 스와이프(스크롤 스냅)로 넘긴다.
                  오버레이들은 pointer-events-none이라 제스처를 막지 않는다. */}
              <div
                className="scrollbar-hidden flex h-full w-full snap-x snap-mandatory overflow-x-auto"
                onScroll={handleHeroScroll}
              >
                {place.imageUrls.map((url, index) => (
                  <div key={url} className="relative h-full w-full shrink-0 snap-center">
                    <Image
                      src={url}
                      alt={
                        index === 0
                          ? `${place.title} 대표 사진`
                          : `${place.title} 사진 ${index + 1}`
                      }
                      fill
                      {...(index === 0 ? { preload: true } : {})}
                      sizes="(min-width: 640px) 640px, 100vw"
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>

              <div aria-hidden className={`pointer-events-none absolute inset-0 ${HERO_SHADE}`} />
              <div
                aria-hidden
                className={`pointer-events-none absolute inset-x-0 bottom-0 h-40 ${HERO_DIM}`}
              />

              <span className="pointer-events-none absolute top-[18px] right-5 rounded-full bg-overlay-dark-50 px-[9px] py-[5px]">
                <span className="type-label-md text-text-on-image">
                  {Math.min(photoIndex, place.imageUrls.length - 1) + 1}/{place.imageUrls.length}
                </span>
              </span>

              <div className="pointer-events-none absolute inset-x-5 bottom-[46px] flex flex-col gap-3">
                <h1 className="type-heading-lg text-text-on-image">{place.title}</h1>
                {/* 사진 개수만큼 인디케이터 바 — 현재 장이 넓은 브랜드 바가 된다. */}
                <div className="flex items-center gap-2" aria-hidden>
                  {place.imageUrls.map((url, index) => (
                    <span
                      key={url}
                      className={
                        index === Math.min(photoIndex, place.imageUrls.length - 1)
                          ? // 액센트(brand-500, 주황끼) 대신 브랜드 레드 계열 —
                            // 어두운 사진 위 시인성 때문에 700보다 한 단계 밝은 600.
                            'h-[5px] w-[70px] rounded-full bg-brand-600'
                          : 'h-[5px] w-9 rounded-full bg-overlay-light-strong'
                      }
                    />
                  ))}
                </div>
              </div>
            </section>

            <LocationSection place={place} />

            {/* pt-12: 주소 행과의 간격을 기존 32px의 1.5배(48px)로 벌린다. */}
            <section className="mx-auto flex w-full max-w-[640px] flex-col gap-6 px-5 pt-12 pb-6">
              <h2 className="type-heading-md text-text-strong">왜 숨은 맛집인가요?</h2>
              <p className="type-body-lg text-text-body">{place.content}</p>
            </section>
          </>
        )}
      </main>
    </div>
  );
}
