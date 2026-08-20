'use client';

/**
 * 메인 상단 이벤트 배너 — 상품(product)의 완성형 배너 크리에이티브를 그대로
 * 건다. 카피·CTA가 이미지에 새겨져 있어 UI는 링크·비율·라운드만 책임진다.
 *
 * 크리에이티브는 두 벌 — 데스크톱(lg+)용 가로형(2048×768 = 8:3)과
 * 모바일·태블릿용(1774×887 ≈ 2:1). `GET /api/events`의 `bannerImage.lg/md`가
 * 각각의 공개 URL이고, ArtDirectedImage가 뷰포트에 맞는 쪽만 내려받는다.
 * 배너 전체가 모임 상세로 가는 링크다.
 */
import Link from 'next/link';

import { ArtDirectedImage } from '@/components';
import type { EventSummary } from '@/lib/events';

export interface EventBannerProps {
  event: EventSummary;
}

export function EventBanner({ event }: EventBannerProps) {
  return (
    <Link
      href={`/events/${event.id}`}
      // 크리에이티브 원본 비율 고정 — 모바일·태블릿 2:1, 데스크톱(lg+) 8:3.
      // shrink-0: 스크롤 컨테이너(flex column) 안에서 높이가 짜부라지지 않게.
      className="relative block aspect-[2/1] shrink-0 overflow-hidden rounded-[20px] lg:aspect-[8/3] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus"
    >
      {/* 이미지가 로드될 때까지 단색 대신 셔머가 이어지도록 아래에 스켈레톤
          레이어를 깐다. */}
      <span aria-hidden className="skeleton-shimmer absolute inset-0 bg-background-skeleton" />
      {event.bannerImage && (
        <ArtDirectedImage
          srcLg={event.bannerImage.lg}
          srcMd={event.bannerImage.md}
          // 카피가 이미지에 새겨진 크리에이티브라 상품명이 곧 배너의 이름이다.
          alt={event.name}
          sizes="(min-width: 1280px) 1216px, 100vw"
          eager
          className="object-cover"
        />
      )}
    </Link>
  );
}
