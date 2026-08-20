import 'server-only'

/**
 * 모임(product)·결제(payment) BFF 공용 헬퍼. 테이블 행을 `src/lib/events.ts`의
 * 응답 타입 모양으로 바꾸는 일만 한다.
 */

const BUCKET = 'product-image'

export const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/** 상품 이미지도 place와 같은 방식으로 서버에서 공개 URL을 조립해 내려준다. */
export function toProductImageUrl(imagePath: string): string {
  return `${process.env.SUPABASE_STORAGE_URL}/${BUCKET}/${imagePath}`
}

export interface ProductRow {
  id: string
  name: string
  description: string
  event_at: string
  address: string
  capacity: number
  /** numeric 컬럼은 PostgREST가 문자열로 내려주므로 숫자로 바꿔 쓴다. */
  price: number | string
  /** 메인 배너 크리에이티브(카피·CTA 포함) — lg 데스크톱 / md 모바일·태블릿. */
  image_path_main_lg: string
  image_path_main_md: string
  /** 상세 히어로 사진 원본 — lg 데스크톱 / md 모바일·태블릿. */
  image_path_detail_lg: string
  image_path_detail_md: string
}

/** 목록·상세 select가 공유하는 컬럼 목록. */
export const PRODUCT_COLUMNS =
  'id, name, description, event_at, address, capacity, price, image_path_main_lg, image_path_main_md, image_path_detail_lg, image_path_detail_md'

/** lg/md 경로 한 벌을 공개 URL 한 벌로 조립한다. */
function toResponsiveImageUrl(lgPath: string, mdPath: string) {
  return { lg: toProductImageUrl(lgPath), md: toProductImageUrl(mdPath) }
}

/** 배너는 카피·CTA가 새겨진 완성형 크리에이티브(`image_path_main_*`)를 쓴다. */
export function toEventSummary(product: ProductRow) {
  return {
    id: product.id,
    name: product.name,
    eventAt: product.event_at,
    capacity: product.capacity,
    price: Number(product.price),
    bannerImage: toResponsiveImageUrl(
      product.image_path_main_lg,
      product.image_path_main_md
    ),
  }
}

/** 상세 응답 — 배너 필드에 소개·주소·참여 현황과 히어로 사진을 더한다. */
export function toEventDetail(product: ProductRow, participantCount: number) {
  return {
    ...toEventSummary(product),
    description: product.description,
    address: product.address,
    participantCount,
    detailImage: toResponsiveImageUrl(
      product.image_path_detail_lg,
      product.image_path_detail_md
    ),
  }
}

/** 결제 시점의 상품 정보를 그대로 얼려 `payment_snapshot.snapshot_product`에 저장하는 모양. */
export interface ProductSnapshotValue {
  product_id: string
  name: string
  description: string
  event_at: string
  address: string
  capacity: number
  price: number
  image_path_main_lg: string
  image_path_main_md: string
  image_path_detail_lg: string
  image_path_detail_md: string
}

export function toSnapshotValue(product: ProductRow): ProductSnapshotValue {
  return {
    product_id: product.id,
    name: product.name,
    description: product.description,
    event_at: product.event_at,
    address: product.address,
    capacity: product.capacity,
    price: Number(product.price),
    image_path_main_lg: product.image_path_main_lg,
    image_path_main_md: product.image_path_main_md,
    image_path_detail_lg: product.image_path_detail_lg,
    image_path_detail_md: product.image_path_detail_md,
  }
}

/** payment 행 + 스냅샷 조인 결과. 스냅샷은 many-to-one이라 객체로 온다. */
export interface PaymentRowWithSnapshot {
  id: string
  created_at: string
  amount: number | string
  type: string
  transaction_key: string
  payment_snapshot: { snapshot_product: ProductSnapshotValue } | null
}

/** 결제 행을 `PaymentReceipt`(= 내역 항목) JSON 모양으로 바꾼다. */
export function toPaymentReceipt(row: PaymentRowWithSnapshot) {
  const snapshot = row.payment_snapshot?.snapshot_product
  return {
    id: row.id,
    amount: Number(row.amount),
    paidAt: row.created_at,
    eventName: snapshot?.name ?? '',
    eventAt: snapshot?.event_at ?? '',
    eventAddress: snapshot?.address ?? '',
    // 영수증 썸네일은 작게 그리므로 상세 사진의 md 원본이면 충분하다.
    imageUrl: snapshot ? toProductImageUrl(snapshot.image_path_detail_md) : null,
  }
}
