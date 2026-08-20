import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

import {
  UUID_PATTERN,
  toPaymentReceipt,
  type PaymentRowWithSnapshot,
} from '../../events/shared'

function notFound() {
  return NextResponse.json({ error: '결제 내역을 찾을 수 없습니다.' }, { status: 404 })
}

/**
 * 결제 영수증 조회(BFF) — 결제 완료 화면이 쓴다. RLS가 본인 결제만 보여주므로
 * 다른 사람의 결제 id로는 404가 된다. 모임 정보는 결제 시점 스냅샷에서 읽는다.
 */
export async function GET(
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

  const { data: payment, error: paymentError } = await supabase
    .from('payment')
    .select('id, created_at, amount, type, transaction_key, payment_snapshot(snapshot_product)')
    .eq('id', id)
    .eq('type', 'PAYMENT')
    .maybeSingle()

  if (paymentError) {
    return NextResponse.json({ error: '결제 내역을 불러오지 못했습니다.' }, { status: 500 })
  }
  if (!payment) return notFound()

  return NextResponse.json({
    payment: toPaymentReceipt(payment as unknown as PaymentRowWithSnapshot),
  })
}
