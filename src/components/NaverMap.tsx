'use client';

/**
 * NaverMap — `.pen`: `네이버 전체 지도 / 페이지 직접 구성`(07 장소 등록)과
 * `맛집 위치 네이버 미니 지도 / 페이지 직접 구성`(10 맛집 상세).
 *
 * - `full`: 장소 등록 화면의 전면 지도. 네이버 지도 JavaScript API v3로 실제
 *   지도를 그린다. 기본 중심은 서울시청, 핀은 지도 정중앙에 DOM 오버레이로
 *   고정되고 그 아래 지도만 드래그로 움직인다. 클라이언트 키
 *   (`NEXT_PUBLIC_NCP_MAP_CLIENT_ID`)가 없거나 로드·인증에 실패하면 디자인
 *   파일에서 추출한 정적 목업 이미지로 폴백한다. 기본 높이 540px.
 * - `mini`: 상세 화면의 카드형 지도. `center`(DB에 저장된 좌표)가 있으면 실제
 *   지도를 보기 전용(드래그·줌 잠금)으로 그리고 그 좌표 위에 핀(마커)을
 *   올린다 — 지도가 움직이지 않으므로 중앙 고정 핀이 곧 좌표의 마커다.
 *   `center`가 없거나(지도 연동 전 글) 로드·인증에 실패하면 정적 목업으로
 *   폴백한다. 12px 라운드에 사방 보더, 기본 높이 180px.
 */
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

import {
  SEOUL_CITY_HALL,
  loadNaverMapsSdk,
  onNaverMapsAuthFailure,
  type NaverMapCoord,
  type NaverMapEventListener,
  type NaverMapInstance,
} from '@/lib/naver-maps';

import { Icon } from './Icon';
import { cn } from './cn';

export type NaverMapVariant = 'full' | 'mini';

const DEFAULT_ZOOM = 16;

const MAP_IMAGE: Record<NaverMapVariant, string> = {
  full: '/images/naver-map-full.png',
  mini: '/images/naver-map-mini.png',
};

const FRAME: Record<NaverMapVariant, string> = {
  full: 'h-[540px] border-y border-naver-map-border',
  mini: 'h-45 rounded-xl border border-border-default',
};

export interface NaverMapBadgeProps {
  /**
   * `map`: 지도 위 좌하단 배지 (흰 바탕 + 보더).
   * `subtle`: 상세 위치 헤더의 출처 필 (연회색 바탕, 라운드 풀).
   */
  tone?: 'map' | 'subtle';
  className?: string;
}

/** `.pen` `Naver Map Branding` / `NAVER 지도 출처` — N 로고 + NAVER 지도 표기. */
export function NaverMapBadge({ tone = 'map', className }: NaverMapBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex h-7 items-center gap-1.5 px-2.5',
        tone === 'map'
          ? 'rounded-md border border-naver-map-border bg-naver-logo-surface'
          : 'rounded-full bg-background-subtle',
        className,
      )}
    >
      <span aria-hidden className="type-heading-sm text-naver-green">
        N
      </span>
      <span
        className={cn(
          'type-label-md',
          tone === 'map' ? 'text-naver-logo-text' : 'text-text-secondary',
        )}
      >
        NAVER 지도
      </span>
    </span>
  );
}

export interface NaverMapProps {
  variant?: NaverMapVariant;
  /**
   * 지도 중심 좌표. `full`에서 생략하면 서울시청, `mini`에서 생략하면 실지도
   * 없이 정적 목업으로 그린다(지도 연동 전 글 폴백).
   */
  center?: NaverMapCoord;
  /** 마커 위 라벨 필의 텍스트. 목업에서는 생략 시 선택 전 상태로 보고 마커를 그리지 않는다. */
  pinLabel?: string;
  /** 라벨 앞 16px 아이콘 — 장소 등록 화면의 선택 완료 체크(`check`). */
  pinLabelIcon?: string;
  /**
   * 실지도(`full` live) 전용 — 지도 이동·줌이 멈출 때(idle)와 지도 생성 직후
   * 중심 좌표를 알린다. 핀이 중앙 고정이라 이 좌표가 곧 핀 위치다.
   */
  onCenterChanged?: (coord: NaverMapCoord) => void;
  className?: string;
  /** 지도 위에 얹는 오버레이(검색 필드 등). 호출부에서 absolute + z-10으로 배치한다. */
  children?: React.ReactNode;
}

export function NaverMap({
  variant = 'full',
  center,
  pinLabel,
  pinLabelIcon,
  onCenterChanged,
  className,
  children,
}: NaverMapProps) {
  const isFull = variant === 'full';
  // 미니 지도는 보여줄 좌표(center)가 있을 때만 실지도를 시도한다.
  const wantsLive = isFull || center !== undefined;

  const mapElRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<NaverMapInstance | null>(null);
  const [mode, setMode] = useState<'loading' | 'live' | 'fallback'>(
    wantsLive ? 'loading' : 'fallback',
  );

  const centerLat = center?.lat ?? SEOUL_CITY_HALL.lat;
  const centerLng = center?.lng ?? SEOUL_CITY_HALL.lng;

  // 비동기 로드가 끝난 시점의 최신 center로 지도를 만들기 위한 스냅샷.
  const latestCenter = useRef({ lat: centerLat, lng: centerLng });

  // 콜백 교체가 지도 재생성으로 이어지지 않도록 ref로 들고 있는다.
  const onCenterChangedRef = useRef(onCenterChanged);
  useEffect(() => {
    onCenterChangedRef.current = onCenterChanged;
  });

  useEffect(() => {
    if (!wantsLive) return;
    let cancelled = false;
    let idleListener: NaverMapEventListener | null = null;
    const offAuthFailure = onNaverMapsAuthFailure(() => {
      if (!cancelled) setMode('fallback');
    });
    loadNaverMapsSdk()
      .then((maps) => {
        if (cancelled || !mapElRef.current) return;
        const map = new maps.Map(mapElRef.current, {
          center: new maps.LatLng(latestCenter.current.lat, latestCenter.current.lng),
          zoom: DEFAULT_ZOOM,
          ...(isFull
            ? {
                zoomControl: true,
                zoomControlOptions: { position: maps.Position.RIGHT_CENTER },
              }
            : {
                // 미니 지도는 보기 전용 — 움직이지 않아야 중앙 핀이 좌표의
                // 마커로 남는다.
                zoomControl: false,
                draggable: false,
                pinchZoom: false,
                scrollWheel: false,
                keyboardShortcuts: false,
                disableDoubleClickZoom: true,
                disableDoubleTapZoom: true,
                disableTwoFingerTapZoom: true,
              }),
        });
        mapRef.current = map;
        if (isFull) {
          // 드래그·줌이 멈출 때마다(idle) 새 중심을 알린다. 생성 직후에도 한 번
          // 알려 초기 위치(핀 아래)의 주소부터 채울 수 있게 한다.
          const notifyCenter = () => {
            const mapCenter = map.getCenter();
            onCenterChangedRef.current?.({ lat: mapCenter.lat(), lng: mapCenter.lng() });
          };
          idleListener = maps.Event.addListener(map, 'idle', notifyCenter);
          notifyCenter();
        }
        setMode('live');
      })
      .catch(() => {
        if (!cancelled) setMode('fallback');
      });
    return () => {
      cancelled = true;
      offAuthFailure();
      if (idleListener) window.naver?.maps?.Event.removeListener(idleListener);
      mapRef.current?.destroy();
      mapRef.current = null;
    };
  }, [isFull, wantsLive]);

  // 검색에서 고른 장소가 바뀌면 그 좌표로 중심을 옮긴다. 핀은 중앙 고정이라
  // 지도만 움직이면 된다.
  useEffect(() => {
    latestCenter.current = { lat: centerLat, lng: centerLng };
    const maps = window.naver?.maps;
    if (!maps || !mapRef.current) return;
    mapRef.current.setCenter(new maps.LatLng(centerLat, centerLng));
  }, [centerLat, centerLng]);

  const isLive = mode === 'live';
  const isFallback = mode === 'fallback';
  // 실지도는 핀을 항상 중앙에 고정하고, 목업은 기존대로 라벨이 있을 때만 그린다.
  const showPin = wantsLive && !isFallback ? true : Boolean(pinLabel);

  return (
    <div
      className={cn(
        'relative w-full overflow-hidden bg-naver-map-background',
        FRAME[variant],
        className,
      )}
    >
      {/* SDK가 대상 엘리먼트에 인라인 position:relative를 강제하므로 absolute
          스트레치 대신 명시적 크기를 준다 (absolute면 높이가 0으로 접힌다). */}
      {wantsLive && !isFallback && (
        <div ref={mapElRef} aria-label="네이버 지도" className="size-full" />
      )}

      {isFallback && (
        <Image
          src={MAP_IMAGE[variant]}
          alt=""
          fill
          sizes="(min-width: 640px) 640px, 100vw"
          className="object-cover"
        />
      )}

      {/* 선택 위치 마커 + 라벨 — 지도 정중앙 고정. 파란 기본 마커(물방울 핀)의
          꼬리 끝이 좌표를 가리키고, 장소명 라벨은 마커 위에 뜬다. 드래그가
          통과하도록 클릭을 막지 않는다. */}
      {showPin && (
        <div
          className={cn(
            'pointer-events-none absolute top-1/2 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-1.5',
            // 실지도에서는 마커 꼬리 끝이 지도 중심(좌표)과 일치하도록 그룹
            // 높이만큼 올린다. 목업 폴백은 기존 구도대로 가운데 정렬.
            isLive ? '-translate-y-full' : '-translate-y-1/2',
          )}
        >
          {pinLabel && (
            <span className="flex h-8 items-center gap-1.5 rounded-full border border-border-default bg-background-surface px-3.5">
              {pinLabelIcon && (
                <Icon name={pinLabelIcon} size={16} className="text-text-brand" />
              )}
              <span className="type-label-md text-text-default">{pinLabel}</span>
            </span>
          )}
          <svg
            width="32"
            height="42"
            viewBox="0 0 32 42"
            aria-hidden
            className="drop-shadow-md"
          >
            <path
              d="M16 1C7.7 1 1 7.7 1 16c0 11.2 12.7 22.9 15 25 2.3-2.1 15-13.8 15-25C31 7.7 24.3 1 16 1Z"
              fill="var(--color-blue-500)"
              stroke="var(--color-background-surface)"
              strokeWidth="1.5"
            />
            <circle cx="16" cy="16" r="5.5" fill="var(--color-background-surface)" />
          </svg>
        </div>
      )}

      {/* 목업 폴백 전용 장식 컨트롤 — 실지도는 SDK가 컨트롤·브랜딩을 직접 그린다. */}
      {isFull && isFallback && (
        <div aria-hidden>
          {/* 확대 / 축소 컨트롤 */}
          <div className="absolute top-[174px] right-3 w-9 overflow-hidden rounded-md border border-naver-map-border bg-naver-logo-surface">
            <span className="flex h-[38px] items-center justify-center text-naver-logo-text">
              <Icon name="plus" size={20} />
            </span>
            <span className="flex h-[38px] items-center justify-center border-t border-naver-map-border">
              <span className="type-label-lg text-naver-logo-text">−</span>
            </span>
          </div>
          {/* 현재 위치 */}
          <span className="absolute right-3 bottom-[114px] flex size-9 items-center justify-center rounded-full border border-naver-map-border bg-naver-logo-surface text-naver-logo-text">
            <Icon name="refresh" size={20} />
          </span>
          <NaverMapBadge tone="map" className="absolute bottom-3 left-2" />
        </div>
      )}

      {children}
    </div>
  );
}
