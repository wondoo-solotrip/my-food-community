'use client';

/**
 * 01 Main Page — design.pen `01 Main Page` + `11 Main Page / Event Banner`.
 *
 * Mobile keeps the .pen two-column poster grid; the grid widens to 3/4 columns
 * up to the 1280px content column, and anything wider becomes side margins.
 * 로고 아래에는 모임 결제 상품 배너(11)가 들어간다.
 *
 * 목록은 `GET /api/places`, 배너는 `GET /api/events`(BFF)에서 온다.
 * Storybook처럼 API가 없는 환경은 `initialPlaces`·`initialEvent`로 주입한다.
 */
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { Card, EmptyState, Icon, IconButton, Skeleton, TextField } from '@/components';
import type { EventSummary } from '@/lib/events';
import { shortAddress, type PlaceSummary } from '@/lib/places';

import { AppBottomNav } from './_components/app-bottom-nav';
import { EventBanner } from './_components/event-banner';

const CARD_LINK =
  'rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus';

export interface HomeViewProps {
  /** Storybook 등 API가 없는 환경에서 목록을 주입한다. 앱에서는 생략. */
  initialPlaces?: PlaceSummary[];
  /** Storybook 등 API가 없는 환경에서 배너 모임을 주입한다. 앱에서는 생략. */
  initialEvent?: EventSummary | null;
}

export function HomeView({ initialPlaces, initialEvent }: HomeViewProps) {
  const router = useRouter();
  // null이면 아직 불러오는 중이다.
  const [places, setPlaces] = useState<PlaceSummary[] | null>(initialPlaces ?? null);
  // undefined면 로딩 중, null이면 공개 모임이 없어 배너를 숨긴다.
  const [event, setEvent] = useState<EventSummary | null | undefined>(initialEvent);

  useEffect(() => {
    if (initialEvent !== undefined) return;
    let cancelled = false;
    fetch('/api/events')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        // `event: null`(공개 모임 없음)도 그대로 반영해 배너를 숨긴다.
        if (!cancelled) setEvent(data ? (data.event ?? null) : null);
      })
      .catch(() => {
        // API가 없는 환경(Storybook)에서는 배너를 그리지 않는다.
        if (!cancelled) setEvent((prev) => (prev === undefined ? null : prev));
      });
    return () => {
      cancelled = true;
    };
  }, [initialEvent]);

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
    // 앱 셸: 문서 스크롤을 없애고(h-dvh + overflow-hidden) 본문(main)만 스크롤한다.
    // 로고 헤더와 바텀 내비게이션은 셸에 고정되어 오버스크롤 바운스에도 움직이지 않는다.
    <div className="mx-auto flex h-dvh w-full max-w-[1280px] flex-col overflow-hidden">
      <header className="flex w-full items-center gap-2 px-5 pt-4 pb-2 md:px-9 md:pt-8">
        {/* 서비스 로고(/logo.svg) — 흰 배경·food 워드마크를 걷어내고 캐릭터
            마크에 맞게 viewBox를 크롭한 투명 배경 버전. 크기는 아이콘 버튼
            스케일의 중간 단계인 40px(size-10). SVG는 이미지 최적화 대상이
            아니라 unoptimized로 그대로 서빙하고, 제목이 바로 옆에 있어 대체
            텍스트는 비운다. */}
        <Image
          // ?v=4: 구버전 SVG(원색 주황)를 캐시한 브라우저가 브랜드컬러
          // (brand-700) 버전을 다시 받도록 URL을 바꾼다.
          src="/logo.svg?v=4"
          alt=""
          width={40}
          height={40}
          unoptimized
          className="size-10 shrink-0"
        />
        <div className="flex flex-col gap-0.5">
          <h1 className="type-heading-md text-text-strong">맛집커뮤니티</h1>
          <p className="type-label-md text-text-secondary">이번 주말, 어디 가볼까?</p>
        </div>
        {/* 데스크톱(md+)에서는 바텀 내비게이션 대신, 그 마이 항목(20px user
            아이콘 + 12px 라벨)을 같은 크기 그대로 헤더 우측에 둔다. */}
        <span className="ml-auto hidden md:block">
          <button
            type="button"
            onClick={() => router.push('/my')}
            className="flex flex-col items-center justify-center gap-0.5 text-text-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus"
          >
            <Icon name="user" size={20} />
            <span className="type-label-md">마이</span>
          </button>
        </span>
      </header>

      <main className="scrollbar-hidden flex w-full flex-1 flex-col gap-3 overflow-y-auto overscroll-contain px-4 pt-1 pb-4 md:px-8">
        {/* 검색창과 배너는 main의 gap-6(24px) 대신 절반인 gap-3(12px)로 묶는다. */}
        <div className="flex shrink-0 flex-col gap-3">
          <TextField
            label="맛집 검색"
            hideLabel
            size="lg"
            leadingIcon="search"
            placeholder="가족 외식, 주차 가능, 조용한 골목"
            // 검색창은 포커스 시 파란 테두리 강조 없이 조용히 둔다.
            focusRing={false}
          />

          {/* 모임 결제 배너 — 로딩 동안은 크리에이티브와 같은 비율의 스켈레톤. */}
          {event === undefined ? (
            <Skeleton
              variant="rectangle"
              width="100%"
              height="auto"
              className="aspect-[2/1] rounded-[20px] lg:aspect-[8/3]"
            />
          ) : event ? (
            <EventBanner event={event} />
          ) : null}
        </div>

        {/* 섹션 헤더와 카드 그리드는 main의 gap 대신 gap-3(12px)로 묶고,
            위 배너와는 mt-6을 더해 띄운다. */}
        <section className="mt-6 flex flex-col gap-3">
        <div className="flex flex-col gap-0.5">
          {/* 18px은 토큰 스케일(16/20) 밖이라 heading 조판(600·1.2·-2%)을 임의 크기로 편다. */}
          <h2 className="text-[18px] leading-[1.2] font-semibold tracking-[-0.02em] text-text-default">
            이 맛집 어때요?
          </h2>
          <p className="type-body-md text-text-secondary">대부도 숨은 맛집</p>
        </div>

        {places === null ? (
          <div className="grid grid-cols-2 gap-x-4 gap-y-5 sm:grid-cols-3 xl:grid-cols-4">
            {/* 플랫 포스터 카드와 같은 구도: 154px 라운드 사진 + 제목·주소 두 줄. */}
            {Array.from({ length: 4 }, (_, i) => (
              <div key={i} className="flex flex-col">
                <Skeleton
                  variant="rectangle"
                  width="100%"
                  height="auto"
                  className="aspect-square rounded-2xl"
                />
                <div className="flex flex-col gap-1 py-2">
                  <Skeleton variant="rectangle" width="72%" height={16} className="rounded-sm" />
                  <Skeleton variant="rectangle" width="45%" height={13} className="rounded-sm" />
                </div>
              </div>
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
                      // 사진이 로드될 때까지 단색 대신 셔머가 이어지도록
                      // 사진 아래에 스켈레톤 레이어를 깐다.
                      <span className="relative block h-full w-full">
                        <span
                          aria-hidden
                          className="skeleton-shimmer absolute inset-0 bg-background-skeleton"
                        />
                        <Image
                          src={place.imageUrl}
                          alt=""
                          width={1408}
                          height={768}
                          loading={index < 2 ? 'eager' : undefined}
                          className="relative h-full w-full object-cover"
                        />
                      </span>
                    ) : (
                      true
                    )
                  }
                  // 흰 배경 위 플랫 포스터: 테두리 없이, 텍스트는 사진 가장자리에 정렬.
                  bordered={false}
                  contentClassName="gap-0 px-0 py-2"
                  // 고정 높이 대신 1:1 비율 — 데스크톱처럼 칼럼이 넓어져도
                  // 모바일과 같은 비율을 유지한다. 라운드는 카드와 동일.
                  imageClassName="aspect-square w-full overflow-hidden rounded-2xl"
                  // 포스터 그리드 제목은 14px(type-label-lg)로 한 단계 작게 쓴다.
                  titleClassName="type-label-lg"
                  title={place.title}
                  metadata={{ text: shortAddress(place.address) }}
                />
              </Link>
            ))}
          </div>
        )}
        </section>

        {/* 플로팅 글쓰기 버튼 — 스크롤 영역(main) 하단에 12px 띄워 고정한다.
            바텀 내비게이션은 셸에 있어 겹치지 않는다. */}
        <div className="sticky bottom-3 z-20 flex justify-end">
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
