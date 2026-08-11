/**
 * 네이버 지도 JavaScript API v3(NCP Maps) 로더 — 클라이언트 전용.
 *
 * 지도 SDK는 브라우저에서 `<script>`로 로드해야 하므로 클라이언트 키
 * (`NEXT_PUBLIC_NCP_MAP_CLIENT_ID`)를 사용한다. 이 키는 NCP 콘솔의 서비스
 * 도메인 제한으로 보호되는 공개용 키라 Supabase BFF 규칙(서버 전용 키)과는
 * 별개다. 키가 없거나 로드·인증에 실패하면 호출부(NaverMap)가 정적 목업으로
 * 폴백한다.
 */

/** 기본 지도 중심 — 서울시청. */
export const SEOUL_CITY_HALL = { lat: 37.5666102, lng: 126.9783881 } as const;

export interface NaverMapCoord {
  lat: number;
  lng: number;
}

/* 공식 타입 패키지가 없어 우리가 쓰는 SDK 표면만 선언한다. */
export interface NaverLatLng {
  lat(): number;
  lng(): number;
}

export interface NaverMapInstance {
  setCenter(coord: NaverLatLng): void;
  getCenter(): NaverLatLng;
  destroy(): void;
}

/** `Event.addListener`가 돌려주는 리스너 핸들 — 해제에만 쓰는 불투명 값. */
export type NaverMapEventListener = unknown;

interface NaverMapOptions {
  center: NaverLatLng;
  zoom?: number;
  zoomControl?: boolean;
  zoomControlOptions?: { position: unknown };
  /* 보기 전용 지도(상세 미니 지도)를 위한 상호작용 잠금 옵션. */
  draggable?: boolean;
  pinchZoom?: boolean;
  scrollWheel?: boolean;
  keyboardShortcuts?: boolean;
  disableDoubleClickZoom?: boolean;
  disableDoubleTapZoom?: boolean;
  disableTwoFingerTapZoom?: boolean;
}

export interface NaverMapsSdk {
  Map: new (el: HTMLElement, options: NaverMapOptions) => NaverMapInstance;
  LatLng: new (lat: number, lng: number) => NaverLatLng;
  Position: { RIGHT_CENTER: unknown };
  Event: {
    addListener(
      target: unknown,
      eventName: string,
      listener: () => void,
    ): NaverMapEventListener;
    removeListener(listener: NaverMapEventListener): void;
  };
}

declare global {
  interface Window {
    naver?: { maps?: NaverMapsSdk };
    /** SDK가 키 인증 실패 시 호출하는 전역 훅 (네이버 규약). */
    navermap_authFailure?: () => void;
  }
}

const SDK_URL = 'https://oapi.map.naver.com/openapi/v3/maps.js';

let sdkPromise: Promise<NaverMapsSdk> | null = null;
let authFailed = false;
const authFailureHandlers = new Set<() => void>();

/**
 * 인증 실패는 스크립트 onload 이후 비동기로 통지될 수 있어 로드 성공과 별도로
 * 구독한다. 이미 실패한 상태면 즉시 호출된다. 반환값은 구독 해제 함수.
 */
export function onNaverMapsAuthFailure(handler: () => void): () => void {
  if (authFailed) handler();
  authFailureHandlers.add(handler);
  return () => {
    authFailureHandlers.delete(handler);
  };
}

/** SDK를 한 번만 로드해 공유한다. 실패 시 reject — 호출부는 목업으로 폴백. */
export function loadNaverMapsSdk(): Promise<NaverMapsSdk> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('네이버 지도 SDK는 브라우저에서만 로드할 수 있습니다.'));
  }
  const clientId = process.env.NEXT_PUBLIC_NCP_MAP_CLIENT_ID;
  if (!clientId) {
    return Promise.reject(new Error('NEXT_PUBLIC_NCP_MAP_CLIENT_ID가 설정되지 않았습니다.'));
  }
  if (window.naver?.maps) return Promise.resolve(window.naver.maps);
  if (sdkPromise) return sdkPromise;

  window.navermap_authFailure = () => {
    authFailed = true;
    sdkPromise = null;
    authFailureHandlers.forEach((handler) => handler());
  };

  sdkPromise = new Promise<NaverMapsSdk>((resolve, reject) => {
    const fail = (message: string) => {
      // 다음 마운트에서 재시도할 수 있게 캐시를 비운다.
      sdkPromise = null;
      reject(new Error(message));
    };
    const script = document.createElement('script');
    script.src = `${SDK_URL}?ncpKeyId=${encodeURIComponent(clientId)}`;
    script.async = true;
    script.onload = () => {
      if (window.naver?.maps) resolve(window.naver.maps);
      else fail('네이버 지도 SDK를 초기화하지 못했습니다.');
    };
    script.onerror = () => fail('네이버 지도 SDK를 불러오지 못했습니다.');
    document.head.appendChild(script);
  });
  return sdkPromise;
}
