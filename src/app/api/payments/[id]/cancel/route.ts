import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

import {
  UUID_PATTERN,
  type ProductSnapshotValue,
} from '../../../events/shared'

function notFound() {
  return NextResponse.json({ error: '결제 내역을 찾을 수 없습니다.' }, { status: 404 })
}

interface CancelTargetRow {
  id: string
  transaction_key: string
  amount: number | string
  type: string
  product_id: string
  payment_snapshot_id: string
  payment_snapshot: { snapshot_product: ProductSnapshotValue } | null
}

/**
 * 결제 취소(BFF). 규칙: rules/payment.md (SSOT).
 * 행을 지우는 대신 같은 transaction_key로 type='CANCEL' 원장 행을 추가한다.
 * (transaction_key, type) 유니크 인덱스가 중복 취소를 DB에서 막는다. 모임 시작
 * 후에는 취소할 수 없다. 포트원 결제 취소 API 연동은 아직 없다(전액 환불 목업)
 * — 연동 시 원장 기록 전에 취소 API가 성공해야 한다.
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
    .select(
      'id, transaction_key, amount, type, product_id, payment_snapshot_id, payment_snapshot(snapshot_product)'
    )
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

  // 부호 규칙: PAYMENT는 +, CANCEL은 − (rules/payment.md). 전액 환불만 지원한다.
  const { error: cancelError } = await supabase.from('payment').insert({
    transaction_key: target.transaction_key,
    type: 'CANCEL',
    amount: -Math.abs(Number(target.amount)),
    product_id: target.product_id,
    user_id: user.id,
    payment_snapshot_id: target.payment_snapshot_id,
  })

  if (cancelError) {
    // 23505: (transaction_key, type) 유니크 위반 — 이미 취소된 결제다.
    if (cancelError.code === '23505') {
      return NextResponse.json({ error: '이미 취소된 결제예요.' }, { status: 409 })
    }
    return NextResponse.json({ error: '결제 취소에 실패했습니다.' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
