'use client';

/**
 * 15 Event Detail — design.pen `15 Event Detail / August Food Gathering`.
 *
 * 히어로 사진 위 상품명, DATE/PLACE/SEATS 메타, 소개 글, 안내 박스,
 * 하단 고정 결제 바. 결제하기를 누르면 결제 바텀시트(payment-sheet)가 뜬다.
 * 맛집 상세와 같은 규칙 — 데스크톱에서도 히어로가 모바일 비율을 유지하도록
 * 본문 전체를 640px 칼럼으로 중앙 정렬한다.
 *
 * 데이터는 `GET /api/events/[id]`(BFF)에서 온다. 히어로 사진은 데스크톱용
 * `detailImage.lg`, 모바일·태블릿용 `detailImage.md`를 아트 디렉션으로 건다.
 * Storybook은 `initialEvent`로 다른 상태를 주입한다.
 */
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { ArtDirectedImage, Button, EmptyState, Skeleton } from '@/components';
import {
  EVENT_CAMPAIGN,
  formatEventDateTime,
  formatPrice,
  type EventDetail,
} from '@/lib/events';

import { AppTopNav } from '../../_components/app-top-nav';
import { PaymentSheet } from './payment-sheet';

/** `.pen` Event Detail Image Shade — 사진 하단으로 갈수록 어두워지는 워시. */
const HERO_SHADE =
  'bg-[linear-gradient(to_bottom,var(--color-overlay-transparent)_0%,var(--color-overlay-dark-strong)_100%)]';

export interface EventDetailViewProps {
  id: string;
  /** Storybook 등 API가 없는 환경에서 상세를 주입한다. 앱에서는 생략. */
  initialEvent?: EventDetail;
}

export function EventDetailView({ id, initialEvent }: EventDetailViewProps) {
  const router = useRouter();
  // undefined면 로딩 중, null이면 찾지 못한 것(비공개·삭제 포함).
  const [event, setEvent] = useState<EventDetail | null | undefined>(initialEvent);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/events/${id}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (cancelled) return;
        if (data?.event) setEvent(data.event);
        else setEvent((prev) => prev ?? null);
      })
      .catch(() => {
        // API가 없는 환경(Storybook)에서는 주입된 상세를 유지한다.
        if (!cancelled) setEvent((prev) => (prev === undefined ? null : prev));
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const isSoldOut = event != null && event.participantCount >= event.capacity;

  return (
    // 앱 셸: 문서 스크롤 없이 본문(main)만 스크롤한다 — 상단 내비게이션·결제 바 고정.
    <div className="mx-auto flex h-dvh w-full max-w-[1280px] flex-col overflow-hidden">
      <AppTopNav title="모임 상세" backHref="/" />

      <main className="scrollbar-hidden flex w-full flex-1 flex-col overflow-y-auto overscroll-contain">
        {event === undefined ? (
          <>
            <div className="mx-auto w-full max-w-[640px]">
              <Skeleton
                variant="rectangle"
                width="100%"
                height="auto"
                className="aspect-[3/2] rounded-none"
              />
            </div>
            {/* 메타 3칸 → 소개 글 구도의 스켈레톤. */}
            <div className="mx-auto flex w-full max-w-[640px] flex-col gap-6 px-5 pt-6 pb-8">
              <div className="flex gap-3 border-b border-border-default pb-5">
                {Array.from({ length: 3 }, (_, i) => (
                  <div key={i} className="flex min-w-0 flex-1 flex-col gap-1">
                    <Skeleton variant="rectangle" width={44} height={14} className="rounded-sm" />
                    <Skeleton variant="rectangle" width="80%" height={14} className="rounded-sm" />
                  </div>
                ))}
              </div>
              <Skeleton variant="text" lines={3} width="100%" />
            </div>
          </>
        ) : event === null ? (
          <EmptyState
            visual="search"
            title="모임을 찾을 수 없어요"
            description="마감됐거나 더 이상 공개되지 않는 모임이에요."
            primaryAction={{ label: '홈으로 가기', onClick: () => router.push('/') }}
            className="flex-1"
          />
        ) : (
          <>
            {/* 고정 높이 대신 상세 사진 원본 비율(3:2) 고정 — 640px 칼럼에
                담아 데스크톱에서도 같은 비율로 보인다. */}
            <section className="relative mx-auto aspect-[3/2] w-full max-w-[640px] shrink-0 overflow-hidden">
              {/* 사진이 로드될 때까지 단색 대신 셔머가 이어지도록 스켈레톤
                  레이어를 깐다. */}
              <span
                aria-hidden
                className="skeleton-shimmer absolute inset-0 bg-background-skeleton"
              />
              {event.detailImage && (
                <ArtDirectedImage
                  srcLg={event.detailImage.lg}
                  srcMd={event.detailImage.md}
                  alt={`${event.name} 대표 사진`}
                  sizes="(min-width: 640px) 640px, 100vw"
                  eager
                  className="object-cover"
                />
              )}
              <div aria-hidden className={`absolute inset-0 ${HERO_SHADE}`} />
              <div className="absolute inset-x-0 bottom-[25px] mx-auto w-full max-w-[640px] px-5">
                <div className="flex flex-col gap-2">
                  <span className="type-label-md font-semibold tracking-[0.1em] text-brand-300">
                    {EVENT_CAMPAIGN.eyebrowVol}
                  </span>
                  <h1 className="type-heading-lg text-text-on-image">{event.name}</h1>
                </div>
              </div>
            </section>

            <div className="mx-auto flex w-full max-w-[640px] flex-col gap-6 px-5 pt-6 pb-8">
              <dl className="flex gap-3 border-b border-border-default pb-5">
                {[
                  ['DATE', formatEventDateTime(event.eventAt)],
                  ['PLACE', event.address],
                  ['SEATS', `${event.participantCount} / ${event.capacity}명`],
                ].map(([label, value]) => (
                  <div key={label} className="flex min-w-0 flex-1 flex-col gap-1">
                    <dt className="type-label-md font-semibold text-text-brand">{label}</dt>
                    <dd className="type-label-md truncate font-semibold text-text-default">
                      {value}
                    </dd>
                  </div>
                ))}
              </dl>

              <section className="flex flex-col gap-3">
                <h2 className="type-heading-md text-text-default">
                  {EVENT_CAMPAIGN.storyTitle}
                </h2>
                <p className="type-body-md text-text-body">{event.description}</p>
              </section>

              <section className="flex flex-col gap-2 rounded-xl bg-background-brand-subtle p-4">
                <h2 className="type-label-lg text-text-default">참여 전 확인해주세요</h2>
                <ul className="flex flex-col">
                  {EVENT_CAMPAIGN.notices.map((notice) => (
                    <li key={notice} className="type-label-md text-text-secondary">
                      • {notice}
                    </li>
                  ))}
                </ul>
              </section>
            </div>
          </>
        )}
      </main>

      {event && (
        <div className="shrink-0 border-t border-border-default bg-background-surface px-4 py-3">
          <Button
            size="lg"
            className="w-full md:mx-auto md:flex md:max-w-[400px]"
            disabled={isSoldOut}
            onClick={() => setIsSheetOpen(true)}
          >
            {isSoldOut ? '남은 자리가 없어요' : `${formatPrice(event.price)} 결제하기`}
          </Button>
        </div>
      )}

      {event && isSheetOpen && (
        <PaymentSheet event={event} onClose={() => setIsSheetOpen(false)} />
      )}
    </div>
  );
}
