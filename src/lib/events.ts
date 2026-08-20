/**
 * 모임 결제 BFF(`/api/events*`, `/api/payments*`, `/api/my/payments`) 응답 타입과
 * 화면 표기 헬퍼. Route Handler가 내려주는 JSON과 화면(클라이언트 컴포넌트)이
 * 공유한다.
 */

/**
 * 모임 상세·영수증이 쓰는 캠페인 고정 카피 — design.pen 15·17.
 * product 테이블에는 컬럼이 없는 크리에이티브 문구라 상수로 관리한다.
 * 날짜·장소·정원·가격 같은 데이터 필드는 전부 DB에서 온다. 메인 배너는
 * 카피·CTA가 새겨진 완성형 크리에이티브 이미지라 UI 카피가 없다.
 */
export const EVENT_CAMPAIGN = {
  /** 상세 히어로·영수증 아이브로. */
  eyebrowVol: 'GURO TABLE · VOL.01',
  storyTitle: '이번엔 후기 너머에서 만나요',
  notices: [
    '본인 1자리만 결제할 수 있어요.',
    '모임 시작 전까지 전액 환불 가능합니다.',
    '알레르기가 있다면 결제 후 운영진에게 알려주세요.',
  ],
} as const;

/**
 * 상품 이미지 한 벌 — `lg`는 데스크톱(≥1024px), `md`는 모바일·태블릿에서
 * 쓴다. 스토리지 공개 URL은 서버(BFF)가 조립해 내려준다.
 */
export interface ResponsiveImageUrl {
  lg: string;
  md: string;
}

/** GET /api/events — 메인 배너에 올릴 현재 공개 모임. */
export interface EventSummary {
  id: string;
  name: string;
  eventAt: string;
  capacity: number;
  price: number;
  /** 메인 배너 크리에이티브 — DB `image_path_main_lg/md`. */
  bannerImage: ResponsiveImageUrl | null;
}

/** GET /api/events/[id] — 모임 상세. participantCount는 결제 수 - 취소 수. */
export interface EventDetail extends EventSummary {
  description: string;
  /** 모임 장소 표기 — DB `product.address`. */
  address: string;
  participantCount: number;
  /** 상세 히어로 사진 — DB `image_path_detail_lg/md`. */
  detailImage: ResponsiveImageUrl | null;
}

/**
 * POST /api/payments/complete·GET /api/payments/[id] — 결제 완료 영수증.
 * 모임 정보는 결제 시점의 payment_snapshot(snapshot_product)에서 오므로 이후
 * 상품이 바뀌어도 표기가 유지된다.
 */
export interface PaymentReceipt {
  id: string;
  amount: number;
  paidAt: string;
  eventName: string;
  eventAt: string;
  eventAddress: string;
  imageUrl: string | null;
}

/** GET /api/my/payments `payments[]` — 취소되지 않은 결제(참여 확정). */
export type PaymentHistoryItem = PaymentReceipt;

/** GET /api/my/payments `canceled[]` — 취소 원장 행(환불 완료). */
export interface CanceledHistoryItem {
  id: string;
  amount: number;
  canceledAt: string;
  eventName: string;
}

/* -- 표기 헬퍼 --------------------------------------------------------------
   저장은 UTC ISO 문자열이므로 표기는 항상 Asia/Seoul 기준으로 변환한다. */

const KST = 'Asia/Seoul';

const KST_NUMERIC = new Intl.DateTimeFormat('en-US', {
  timeZone: KST,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
});
const KST_WEEKDAY_KO = new Intl.DateTimeFormat('ko-KR', { timeZone: KST, weekday: 'short' });

function kstParts(iso: string) {
  const date = new Date(iso);
  const parts: Partial<Record<Intl.DateTimeFormatPartTypes, string>> = {};
  for (const part of KST_NUMERIC.formatToParts(date)) parts[part.type] = part.value;
  return {
    year: parts.year ?? '',
    month: parts.month ?? '',
    day: parts.day ?? '',
    hour: parts.hour ?? '',
    minute: parts.minute ?? '',
    monthNum: Number(parts.month),
    dayNum: Number(parts.day),
    weekdayKo: KST_WEEKDAY_KO.format(date),
  };
}

/** `30000` → `30,000원` */
export function formatPrice(amount: number): string {
  return `${amount.toLocaleString('ko-KR')}원`;
}

/** 상세 DATE 값 — 예: `8.29 금 19:30` */
export function formatEventDateTime(iso: string): string {
  const p = kstParts(iso);
  return `${p.monthNum}.${p.dayNum} ${p.weekdayKo} ${p.hour}:${p.minute}`;
}

/** 결제 내역 일정 한 줄 — 예: `8.29 금 · 19:30 · 구로시장 키친` */
export function formatEventSchedule(iso: string, place: string): string {
  const p = kstParts(iso);
  return `${p.monthNum}.${p.dayNum} ${p.weekdayKo} · ${p.hour}:${p.minute} · ${place}`;
}

/** 결제·취소 일시와 영수증 참여 일정 표기 — 예: `2026.08.13 21:04` */
export function formatPaymentDateTime(iso: string): string {
  const p = kstParts(iso);
  return `${p.year}.${p.month}.${p.day} ${p.hour}:${p.minute}`;
}
