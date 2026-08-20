import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

import {
  UUID_PATTERN,
  type ProductSnapshotValue,
} from '../../../events/shared'
import { cancelPortonePayment, verifyAndRecordCancel } from '../../shared'

function notFound() {
  return NextResponse.json({ error: '결제 내역을 찾을 수 없습니다.' }, { status: 404 })
}

interface CancelTargetRow {
  id: string
  transaction_key: string
  type: string
  payment_snapshot: { snapshot_product: ProductSnapshotValue } | null
}

/**
 * 결제 취소(BFF). 규칙: rules/payment.md (SSOT).
 *
 * 원장 기록 **전에** 포트원 결제 취소 API가 성공해야 한다(전액 환불만 지원).
 * 기록은 취소 웹훅과 공용 경로인 verifyAndRecordCancel — 포트원 단건 조회로
 * CANCELLED를 재검증한 뒤 같은 transaction_key로 type='CANCEL' 행을
 * insert-only로 추가한다. 취소 후 기록이 일시 오류로 실패해도 취소 웹훅
 * (Transaction.Cancelled)이 원장을 채운다. 모임 시작 후에는 취소할 수 없다.
 */
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  if (!UUID_PATTERN.test(id)) return notFound()

  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
  }

  // RLS가 본인 결제만 보여준다 — 남의 결제 id는 여기서 404가 된다.
  const { data: payment, error: paymentError } = await supabase
    .from('payment')
    .select('id, transaction_key, type, payment_snapshot(snapshot_product)')
    .eq('id', id)
    .maybeSingle()

  if (paymentError) {
    return NextResponse.json({ error: '결제 내역을 불러오지 못했습니다.' }, { status: 500 })
  }
  const target = payment as unknown as CancelTargetRow | null
  if (!target || target.type !== 'PAYMENT') return notFound()

  const eventAt = target.payment_snapshot?.snapshot_product.event_at
  if (eventAt && new Date(eventAt).getTime() <= Date.now()) {
    return NextResponse.json(
      { error: '이미 시작된 모임은 취소할 수 없어요.' },
      { status: 409 }
    )
  }

  // 이미 취소 원장이 있으면 포트원을 호출할 필요가 없다.
  const { data: canceled, error: canceledError } = await supabase
    .from('payment')
    .select('id')
    .eq('transaction_key', target.transaction_key)
    .eq('type', 'CANCEL')
    .maybeSingle()

  if (canceledError) {
    return NextResponse.json({ error: '취소 내역을 확인하지 못했습니다.' }, { status: 500 })
  }
  if (canceled) {
    return NextResponse.json({ error: '이미 취소된 결제예요.' }, { status: 409 })
  }

  if (!process.env.PORTONE_V2_API_SECRET) {
    return NextResponse.json(
      { error: '결제 취소 설정이 없습니다. PORTONE_V2_API_SECRET을 설정해주세요.' },
      { status: 500 }
    )
  }

  // 포트원 취소가 성공해야만 원장에 기록한다 — 실패하면 기록하지 않는다.
  // 이미 취소된 결제(콘솔 수동 취소 등)는 성공으로 취급해 원장을 메운다.
  const cancelResult = await cancelPortonePayment(
    target.transaction_key,
    '구매자 요청 전액 환불'
  )
  if (!cancelResult.ok) {
    if (cancelResult.status === 0 || cancelResult.status >= 500) {
      return NextResponse.json(
        { error: '취소 요청에 실패했습니다. 잠시 후 다시 시도해주세요.' },
        { status: 502 }
      )
    }
    console.warn(
      `[payments/cancel] 포트원 취소 거절 paymentId=${target.transaction_key} (${cancelResult.status}): ${cancelResult.errorType ?? 'unknown'}`
    )
    return NextResponse.json({ error: '취소할 수 없는 결제예요.' }, { status: 409 })
  }

  // 단건 조회로 CANCELLED를 재검증한 뒤 기록한다 — 취소 웹훅과 공용 경로라
  // 멱등이고, 웹훅이 먼저 기록해도 성공으로 끝난다.
  const record = await verifyAndRecordCancel(supabase, target.transaction_key)
  if (!record.ok) {
    return NextResponse.json({ error: record.error }, { status: record.status })
  }

  return NextResponse.json({ ok: true })
}
