'use client';

/**
 * 07 장소 등록 — design.pen `07 장소 등록 페이지`(YYQb3).
 *
 * 장소 입력의 첫 화면. 전면 지도는 네이버 지도 API로 그린다 — 기본 중심은
 * 서울시청, 핀은 지도 정중앙에 고정되고 그 아래 지도만 드래그로 움직인다.
 * 지도 위 검색 필드를 누르면 장소 검색(08)으로 전환되고, 검색에서 고른
 * 장소는 장소명이 검색 필드에, 지번 주소가 주소 행에 들어가고 지도 중심이
 * 그 좌표로 이동한 뒤 "이 위치로 등록하기"로 확정한다.
 *
 * 실지도에서는 지도를 움직일 때마다 중심 좌표를 리버스 지오코딩 BFF
 * (`/api/reverse-geocode`)로 조회해 주소 행을 현재 핀 위치의 지번 주소로
 * 갱신하고, 확정 시 그 주소·좌표가 폼으로 넘어간다. 마커 위 라벨은 장소명
 * 전용이다 — 장소를 고르거나 직접 입력하기 전에는 라벨 없이 핀만 보이고,
 * 장소명이 정해지면 그 이름이 찍힌다. 지도를 움직여도 라벨은 장소명을
 * 유지하고 주소 행만 바뀐다. 직접 입력한 장소도 지도를 움직여 주소를
 * 채운다. (목업 폴백에서는 조회가 없어 검색에서 받은 지번 주소만 보인다.)
 *
 * 지도 정보는 필수다 — 장소명·지번 주소·좌표가 모두 준비돼야 "이 위치로
 * 등록하기"가 활성화되고, 하나라도 없으면 확정할 수 없다.
 *
 * `place`가 없으면 선택 전 상태다. 디자인 파일에는 선택 완료 상태만 있어서,
 * 선택 전에는 주소 행을 숨기고 등록 버튼을 비활성화하는 것으로 보완했다.
 */
import { useCallback, useRef, useState } from 'react';

import { AddressRow, Button, Icon, NaverMap, TopNavigation, cn } from '@/components';
import type { NaverMapCoord } from '@/lib/naver-maps';
import type { PlaceSearchResult } from '@/lib/places';

export interface PlaceConfirmViewProps {
  /** 지도에 표시할 선택된 장소. 없으면 선택 전 상태. */
  place?: PlaceSearchResult;
  /** 지도 위 검색 필드를 눌러 장소 검색(08)으로 전환한다. */
  onSearch: () => void;
  onBack: () => void;
  /**
   * 지도에 보이는 대로 확정한다 — 주소·좌표는 현재 지도 중심 기준이고,
   * 장소명·지번 주소·좌표가 모두 채워진 상태로만 호출된다(지도 정보 필수).
   */
  onConfirm: (place: PlaceSearchResult) => void;
}

export function PlaceConfirmView({ place, onSearch, onBack, onConfirm }: PlaceConfirmViewProps) {
  // 리버스 지오코딩으로 받은 현재 지도 중심의 지번 주소. 없으면(조회 전·실패·
  // 목업 폴백) 검색에서 받은 지번 주소를 대신 보여준다.
  const [centerAddress, setCenterAddress] = useState<string | null>(null);
  // 실지도가 알려준 현재 지도 중심. 확정 버튼 활성 여부에 쓰여 상태로 든다.
  const [centerCoord, setCenterCoord] = useState<NaverMapCoord | null>(null);
  const lastCoord = useRef<NaverMapCoord | null>(null);
  const requestSeq = useRef(0);

  // 검색으로 장소가 바뀌어 지도가 새 좌표로 이동하면, idle로 새 값이 오기
  // 전까지 이전 위치의 주소·좌표가 남지 않도록 렌더 중에 비운다.
  const placeKey = `${place?.lat},${place?.lng}`;
  const [prevPlaceKey, setPrevPlaceKey] = useState(placeKey);
  if (prevPlaceKey !== placeKey) {
    setPrevPlaceKey(placeKey);
    setCenterAddress(null);
    setCenterCoord(null);
  }

  const handleCenterChanged = useCallback((coord: NaverMapCoord) => {
    const prev = lastCoord.current;
    if (prev && prev.lat === coord.lat && prev.lng === coord.lng) return;
    lastCoord.current = coord;
    setCenterCoord(coord);

    // 늦게 도착한 이전 위치의 응답이 최신 주소를 덮지 않도록 순번으로 거른다.
    const seq = ++requestSeq.current;
    fetch(`/api/reverse-geocode?lat=${coord.lat}&lng=${coord.lng}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { address?: string } | null) => {
        if (seq !== requestSeq.current) return;
        if (data?.address) setCenterAddress(data.address);
      })
      .catch(() => {
        // 조회 실패 시 기존 주소 표시를 유지한다.
      });
  }, []);

  const address = centerAddress ?? (place?.jibunAddress || undefined);
  // 실지도 중심이 우선이고, 목업 폴백에서는 검색 결과의 좌표를 쓴다.
  const coord =
    centerCoord ??
    (place?.lat !== undefined && place?.lng !== undefined
      ? { lat: place.lat, lng: place.lng }
      : null);
  // 지도 정보 필수 — 장소명·지번 주소·좌표가 모두 있어야 확정할 수 있다.
  const canConfirm = Boolean(place && address && coord);

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[1280px] flex-col">
      <TopNavigation
        title="장소 등록"
        leading={{ icon: 'arrow-left', label: '뒤로 가기', onClick: onBack }}
      />

      <main className="mx-auto flex w-full max-w-[640px] flex-1 flex-col gap-5 pb-6">
        <NaverMap
          variant="full"
          center={
            place?.lat !== undefined && place?.lng !== undefined
              ? { lat: place.lat, lng: place.lng }
              : undefined
          }
          pin={Boolean(place)}
          onCenterChanged={handleCenterChanged}
        >
          <button
            type="button"
            onClick={onSearch}
            // 보이는 문구는 예시 검색어(플레이스홀더)라 접근성 이름은 기능명으로 유지한다.
            aria-label={place ? undefined : '장소 검색'}
            className="absolute inset-x-4 top-4 z-10 flex h-10 items-center gap-2 rounded-xl border border-border-default bg-background-surface px-3 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus"
          >
            <Icon name="search" size={20} className="shrink-0 text-text-secondary" />
            <span
              className={cn(
                'type-body-lg min-w-0 flex-1 truncate',
                place ? 'text-text-default' : 'text-text-subtle',
              )}
            >
              {place ? place.name : '대부도손칼국수'}
            </span>
            {place && <span className="sr-only">— 장소 다시 검색</span>}
          </button>
        </NaverMap>

        <div className="flex flex-col gap-5 px-4">
          {address && <AddressRow text={address} tone="secondary" />}
          {place && !canConfirm && (
            <p className="type-label-md text-text-secondary">
              지도에서 주소와 위치가 확인돼야 등록할 수 있어요. 지도를 움직여
              위치를 맞춰주세요.
            </p>
          )}
          <Button
            size="lg"
            leadingIcon="check"
            className="w-full"
            disabled={!canConfirm}
            onClick={() => {
              if (!place || !address || !coord) return;
              onConfirm({
                ...place,
                jibunAddress: address,
                lat: coord.lat,
                lng: coord.lng,
              });
            }}
          >
            이 위치로 등록하기
          </Button>
        </div>
      </main>
    </div>
  );
}
