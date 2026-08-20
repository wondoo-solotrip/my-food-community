import 'server-only'

import type { SupabaseClient } from '@supabase/supabase-js'

import {
  PRODUCT_COLUMNS,
  UUID_PATTERN,
  toPaymentReceipt,
  toSnapshotValue,
  type PaymentRowWithSnapshot,
  type ProductRow,
} from '../events/shared'

/**
 * 포트원 V2 REST API 헬퍼·결제 검증 공용 경로 — 결제 BFF 전용.
 * 규칙: rules/payment.md (SSOT). 시크릿은 서버 전용 환경변수로만 읽는다.
 */

/** 결제 단건 조회 응답에서 검증에 쓰는 필드만 추린 모양. */
export interface PortonePayment {
  status: string
  id: string
  orderName?: string
  currency?: string
  amount?: { total: number }
  /** requestPayment의 customData — JSON 문자열로 온다. */
  customData?: string | null
  paidAt?: string
  channel?: { type?: string; key?: string; name?: string }
}

export type PortonePaymentLookup =
  | { ok: true; payment: PortonePayment }
  | { ok: false; status: number }

/**
 * 결제 단건 조회 — `GET https://api.portone.io/payments/{paymentId}`.
 * V2 API는 Bearer 대신 `PortOne` 인증 스킴을 쓴다.
 */
export async function getPortonePayment(
  paymentId: string
): Promise<PortonePaymentLookup> {
  try {
    const response = await fetch(
      `https://api.portone.io/payments/${encodeURIComponent(paymentId)}`,
      {
        headers: { Authorization: `PortOne ${process.env.PORTONE_V2_API_SECRET}` },
        cache: 'no-store',
        // 포트원 API 지연 시 라우트가 플랫폼 타임아웃까지 매달리지 않게 끊는다.
        signal: AbortSignal.timeout(10_000),
      }
    )
    if (!response.ok) return { ok: false, status: response.status }
    return { ok: true, payment: (await response.json()) as PortonePayment }
  } catch {
    // 네트워크 오류·타임아웃 — 호출부가 502로 바꿔 응답한다.
    return { ok: false, status: 0 }
  }
}

const RECEIPT_COLUMNS =
  'id, created_at, amount, type, transaction_key, payment_snapshot(snapshot_product)'

export type PaymentReceipt = ReturnType<typeof toPaymentReceipt>

export type PaymentRecordResult =
  | { ok: true; created: boolean; receipt: PaymentReceipt }
  /** status ≥ 500은 일시 오류(재시도 의미 있음), 그 외는 영구 거절이다. */
  | { ok: false; status: number; error: string }

/**
 * 결제 검증·기록 공용 경로 — 완료 API(/api/payments/complete)와 결제 웹훅
 * (/api/payments/webhook)이 같은 검증을 거친다. 규칙: rules/payment.md (SSOT).
 *
 * 신뢰 입력은 paymentId(= 원장 transaction_key) 하나뿐이고, 승인 사실·금액은
 * 전부 포트원 결제 단건 조회와 DB 값으로 검증한다. 같은 paymentId가 이미
 * 기록돼 있으면 기존 영수증을 반환하는 멱등 함수다 — 중복 결제 기록은 여기와
 * (transaction_key, type) 유니크 인덱스(최후 방어선)가 막는다.
 *
 * @param sessionUserId 로그인 사용자 id. 웹훅처럼 세션이 없으면 null — 이때는
 *   customData.userId(UUID)를 기록 대상으로 쓰고, auth.users FK가 실존을 보장한다.
 *   null이면 supabase는 RLS를 우회하는 service-role 클라이언트여야 한다.
 */
export async function verifyAndRecordPayment(
  supabase: SupabaseClient,
  paymentId: string,
  sessionUserId: string | null
): Promise<PaymentRecordResult> {
  // 멱등 — transaction_key(= 포트원 paymentId)로 이미 기록된 결제면 그대로 반환.
  const { data: existing, error: existingError } = await supabase
    .from('payment')
    .select(RECEIPT_COLUMNS)
    .eq('transaction_key', paymentId)
    .eq('type', 'PAYMENT')
    .maybeSingle()

  if (existingError) {
    return { ok: false, status: 500, error: '결제 내역을 확인하지 못했습니다.' }
  }
  if (existing) {
    return {
      ok: true,
      created: false,
      receipt: toPaymentReceipt(existing as unknown as PaymentRowWithSnapshot),
    }
  }

  if (!process.env.PORTONE_V2_API_SECRET) {
    return {
      ok: false,
      status: 500,
      error: '결제 검증 설정이 없습니다. PORTONE_V2_API_SECRET을 설정해주세요.',
    }
  }

  // 포트원 결제 단건 조회 — PAID가 아니면 어떤 것도 기록하지 않는다.
  const lookup = await getPortonePayment(paymentId)
  if (!lookup.ok) {
    if (lookup.status === 404) {
      return { ok: false, status: 404, error: '결제 정보를 찾을 수 없습니다.' }
    }
    return { ok: false, status: 502, error: '결제 정보를 확인하지 못했습니다.' }
  }
  const portonePayment = lookup.payment
  if (portonePayment.status !== 'PAID') {
    return { ok: false, status: 409, error: '결제가 완료되지 않았어요.' }
  }

  // 채널 검증 — channelKey는 클라이언트가 고르는 값이라, 서버에서 우리가
  // 설정한 채널로 승인된 결제인지 대조한다(테스트↔라이브 채널 바꿔치기 방지).
  const expectedChannelKey = process.env.NEXT_PUBLIC_PORTONE_CHANNEL_KEY
  if (expectedChannelKey && portonePayment.channel?.key !== expectedChannelKey) {
    return { ok: false, status: 400, error: '허용되지 않은 결제 채널이에요.' }
  }

  // customData는 상품·사용자를 찾는 힌트로만 쓴다 — 검증은 전부 DB 값으로 한다.
  let customData: { productId?: unknown; userId?: unknown } = {}
  try {
    const parsed: unknown = JSON.parse(portonePayment.customData ?? '{}')
    if (parsed && typeof parsed === 'object') customData = parsed
  } catch {
    // 형식이 깨졌으면 아래 productId 검증에서 걸러진다.
  }
  const { productId, userId } = customData
  if (typeof productId !== 'string' || !UUID_PATTERN.test(productId)) {
    return { ok: false, status: 400, error: '결제에 상품 정보가 없습니다.' }
  }
  if (sessionUserId !== null && userId !== sessionUserId) {
    return { ok: false, status: 403, error: '본인 결제만 확정할 수 있어요.' }
  }
  if (typeof userId !== 'string' || !UUID_PATTERN.test(userId)) {
    return { ok: false, status: 400, error: '결제에 사용자 정보가 없습니다.' }
  }

  const { data: product, error: productError } = await supabase
    .from('product')
    .select(PRODUCT_COLUMNS)
    .eq('id', productId)
    .eq('status', 'Public')
    .maybeSingle()

  if (productError) {
    return { ok: false, status: 500, error: '모임 정보를 불러오지 못했습니다.' }
  }
  if (!product) {
    return { ok: false, status: 404, error: '모임을 찾을 수 없습니다.' }
  }
  const productRow = product as unknown as ProductRow

  // 금액 검증 — 결제창 호출값이 위·변조됐다면 여기서 기록이 거부된다.
  if (
    portonePayment.amount?.total !== Number(productRow.price) ||
    portonePayment.currency !== 'KRW' ||
    portonePayment.orderName !== productRow.name
  ) {
    return { ok: false, status: 400, error: '결제 금액이 상품 정보와 일치하지 않습니다.' }
  }

  // 비즈니스 검증 — 이미 승인된 결제라서, 여기서 거절되면 포트원 취소(환불)가
  // 필요하다. 취소 API는 아직 미연동(rules/payment.md TODO) — 콘솔에서 수동 취소.
  const { data: ledger, error: ledgerError } = await supabase
    .from('payment')
    .select('type')
    .eq('user_id', userId)
    .eq('product_id', productId)

  if (ledgerError) {
    return { ok: false, status: 500, error: '결제 내역을 확인하지 못했습니다.' }
  }
  const rows: { type: string }[] = ledger ?? []
  const activeCount =
    rows.filter((row) => row.type === 'PAYMENT').length -
    rows.filter((row) => row.type === 'CANCEL').length
  if (activeCount > 0) {
    return { ok: false, status: 409, error: '이미 참여 확정된 모임이에요.' }
  }

  const { data: participantCount, error: countError } = await supabase.rpc(
    'product_participant_count',
    { target_product_id: productId }
  )
  if (countError) {
    return { ok: false, status: 500, error: '참여 현황을 불러오지 못했습니다.' }
  }
  if ((participantCount ?? 0) >= productRow.capacity) {
    return { ok: false, status: 409, error: '남은 자리가 없어요.' }
  }

  // 스냅샷 → 결제 순서로 기록한다. 스냅샷 SELECT 정책이 "내 결제가 참조하는
  // 것"뿐이라 insert 직후에는 되돌려 읽을 수 없으므로 id를 BFF가 만들어 넘긴다.
  const snapshotId = crypto.randomUUID()
  const snapshotProduct = toSnapshotValue(productRow)
  const { error: snapshotError } = await supabase.from('payment_snapshot').insert({
    id: snapshotId,
    snapshot_product: snapshotProduct,
    snapshot_payment: portonePayment,
  })

  if (snapshotError) {
    return { ok: false, status: 500, error: '결제 기록에 실패했습니다.' }
  }

  // 부호 규칙: PAYMENT는 +, CANCEL은 − (rules/payment.md).
  const { data: inserted, error: paymentError } = await supabase
    .from('payment')
    .insert({
      transaction_key: paymentId,
      type: 'PAYMENT',
      amount: Number(productRow.price),
      product_id: productId,
      user_id: userId,
      payment_snapshot_id: snapshotId,
    })
    .select('id, created_at, amount, type, transaction_key')
    .single()

  if (paymentError || !inserted) {
    // 23505: (transaction_key, type) 유니크 위반 — 동시 호출(완료 API·웹훅 경합
    // 포함)이 먼저 기록했다. 기존 행을 다시 읽어 멱등 반환한다. 이때 위 스냅샷은
    // 어디서도 참조되지 않으므로 그대로 둬도 무해하다.
    if (paymentError?.code === '23505') {
      const { data: raced } = await supabase
        .from('payment')
        .select(RECEIPT_COLUMNS)
        .eq('transaction_key', paymentId)
        .eq('type', 'PAYMENT')
        .maybeSingle()
      if (raced) {
        return {
          ok: true,
          created: false,
          receipt: toPaymentReceipt(raced as unknown as PaymentRowWithSnapshot),
        }
      }
    }
    return { ok: false, status: 500, error: '결제 기록에 실패했습니다.' }
  }

  return {
    ok: true,
    created: true,
    receipt: toPaymentReceipt({
      ...inserted,
      payment_snapshot: { snapshot_product: snapshotProduct },
    } as PaymentRowWithSnapshot),
  }
}
