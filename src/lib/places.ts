/**
 * 맛집 BFF(`/api/places*`) 응답 타입. Route Handler가 내려주는 JSON과
 * 화면(클라이언트 컴포넌트)이 공유한다.
 */

/**
 * `place.address`의 DB 기본값. 지도 연동 전에 등록된 글에만 남아 있는 표식이라,
 * 화면은 이 값을 실제 주소로 취급하면 안 된다 (상세의 위치 섹션·지도 노출
 * 여부가 여기 갈린다). 지금은 지도 정보가 필수라 새 글에는 저장되지 않는다.
 */
export const ADDRESS_PENDING = '등록 대기중';

/** 카드류 주소 표기 — 앞 두 단어(시·도 단위)까지만. 예: `경기도 안산시`. */
export function shortAddress(address: string): string {
  return address.split(' ').slice(0, 2).join(' ');
}

/** GET /api/places 목록 항목. 대표 이미지는 첫 번째 사진이다. */
export interface PlaceSummary {
  id: string;
  title: string;
  content: string;
  address: string;
  createdAt: string;
  imageUrl: string | null;
  imageCount: number;
}

/** GET /api/places/[id] 상세. isOwner가 true면 수정 진입이 열린다. */
export interface PlaceDetail {
  id: string;
  title: string;
  content: string;
  /** 지번 주소 — DB `address`. 지도 연동 전 글에는 `ADDRESS_PENDING`이 남아 있다. */
  address: string;
  /** 지도에서 고른 장소명 — DB `name`. 지도 연동 전 글에만 null이 남아 있다. */
  placeName: string | null;
  /** 지도 핀 좌표(WGS84) — DB `lat`/`lng`. 지도 연동 전 글에만 null이 남아 있다. */
  lat: number | null;
  lng: number | null;
  createdAt: string;
  imageUrls: string[];
  isOwner: boolean;
}

/** GET /api/places/search 결과 항목 — 네이버 지역 검색 API를 BFF가 정리한 것. */
export interface PlaceSearchResult {
  name: string;
  roadAddress: string;
  /** 지번 주소. 네이버 응답의 `address` — 선택 시 주소 영역에 들어가는 값. */
  jibunAddress: string;
  /** WGS84 좌표 — 네이버 `mapy`/`mapx`를 변환한 것. 없으면 지도는 기본 위치(서울시청)를 유지한다. */
  lat?: number;
  lng?: number;
}

/**
 * 폼이 들고 다니는 확정된 장소. 주소·좌표는 지도(07)에서 확정한 시점의 지도
 * 중심 기준이다 — 실지도에서는 리버스 지오코딩(`/api/reverse-geocode`)이 채운
 * 지번 주소가 들어오고, 직접 입력한 장소도 지도를 움직여 주소를 채운다.
 * 지도 정보(장소명·지번 주소·좌표)는 필수라 넷 다 있어야 등록·수정할 수 있고,
 * 그대로 DB `name`·`address`·`lat`·`lng`에 저장된다.
 */
export interface PlaceSelection {
  name: string;
  /** 지번 주소. */
  address: string;
  lat: number;
  lng: number;
}
