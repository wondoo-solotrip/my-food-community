'use client';

/**
 * 01 Main Page — design.pen `01 Main Page`.
 *
 * Mobile keeps the .pen two-column poster grid; the grid widens to 3/4 columns
 * up to the 1280px content column, and anything wider becomes side margins.
 *
 * 목록은 `GET /api/places`(BFF)에서 온다. Storybook처럼 API가 없는 환경은
 * `initialPlaces`로 데이터를 주입한다.
 */
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { Card, EmptyState, Icon, IconButton, Skeleton, TextField } from '@/components';
import type { PlaceSummary } from '@/lib/places';

import { AppBottomNav } from './_components/app-bottom-nav';

const CARD_LINK =
  'rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus';

export interface HomeViewProps {
  /** Storybook 등 API가 없는 환경에서 목록을 주입한다. 앱에서는 생략. */
  initialPlaces?: PlaceSummary[];
}

export function HomeView({ initialPlaces }: HomeViewProps) {
  const router = useRouter();
  // null이면 아직 불러오는 중이다.
  const [places, setPlaces] = useState<PlaceSummary[] | null>(initialPlaces ?? null);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/places')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled && data?.places) setPlaces(data.places);
      })
      .catch(() => {
        // API가 없는 환경(Storybook)에서는 주입된 목록을 유지한다.
      })
      .finally(() => {
        if (!cancelled) setPlaces((prev) => prev ?? []);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[1280px] flex-col">
      <main className="flex w-full flex-1 flex-col gap-6 px-4 pt-2 pb-4 md:px-8 md:pt-6">
        <div className="flex items-center gap-3 px-1 py-2">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-background-brand text-text-on-brand">
            <Icon name="image" size={20} />
          </span>
          <div className="flex flex-col gap-0.5">
            <h1 className="type-heading-md text-text-strong">구로 맛집 지도</h1>
            <p className="type-label-md text-text-secondary">이번 주말, 어디 가볼까?</p>
          </div>
        </div>

        <TextField
          label="맛집 검색"
          hideLabel
          size="lg"
          leadingIcon="search"
          placeholder="가족 외식, 주차 가능, 조용한 골목"
        />

        <div className="flex items-center justify-between">
          <h2 className="type-heading-lg text-text-default">오늘의 숨은 맛집</h2>
          {places !== null && (
            <span className="type-label-lg text-text-brand">{places.length}곳</span>
          )}
        </div>

        {places === null ? (
          <div className="grid grid-cols-2 gap-x-4 gap-y-5 sm:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 4 }, (_, i) => (
              <Skeleton key={i} variant="rectangle" width="100%" height={220} />
            ))}
          </div>
        ) : places.length === 0 ? (
          <EmptyState
            visual="image"
            title="아직 등록된 맛집이 없어요"
            description="동네에서 발견한 숨은 맛집을 가장 먼저 알려주세요."
            primaryAction={{ label: '맛집 등록', onClick: () => router.push('/register') }}
            className="py-10"
          />
        ) : (
          <div className="grid grid-cols-2 gap-x-4 gap-y-5 sm:grid-cols-3 xl:grid-cols-4">
            {places.map((place, index) => (
              <Link key={place.id} href={`/restaurants/${place.id}`} className={CARD_LINK}>
                <Card
                  image={
                    place.imageUrl ? (
                      <Image
                        src={place.imageUrl}
                        alt=""
                        width={1408}
                        height={768}
                        loading={index < 2 ? 'eager' : undefined}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      true
                    )
                  }
                  imageClassName="aspect-[13/11] w-full"
                  title={place.title}
                  metadata={{ icon: 'home', text: place.address }}
                />
              </Link>
            ))}
          </div>
        )}

        <div className="flex justify-end">
          <IconButton
            icon="plus"
            label="맛집 등록"
            variant="brand"
            onClick={() => router.push('/register')}
            className="shadow-[0_8px_20px_var(--color-shadow-action)]"
          />
        </div>
      </main>

      <AppBottomNav />
    </div>
  );
}
