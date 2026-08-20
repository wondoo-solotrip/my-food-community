import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

import { UUID_PATTERN } from '../../events/shared'
import { verifyAndRecordPayment } from '../shared'

/**
 * 결제 완료 검증·기록(BFF) — 결제 완료 페이지가 호출한다. 규칙: rules/payment.md (SSOT).
 *
 * 클라이언트는 포트원 paymentId 하나만 보낸다. 검증·기록은 웹훅과 공용 경로인
 * verifyAndRecordPayment가 수행한다 — 포트원 결제 단건 조회로 승인 사실(PAID)·
 * 금액을 검증한 결제만 원장(payment)에 기록하고 영수증을 돌려준다. 같은
 * paymentId로 다시 호출되면(리디렉션 복귀·새로고침) 기존 영수증을 그대로
 * 반환하는 멱등 API다.
 */
export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
  }

  let paymentId: unknown
  try {
    ;({ paymentId } = await request.json())
  } catch {
    return NextResponse.json({ error: '요청 형식이 올바르지 않습니다.' }, { status: 400 })
  }
  if (typeof paymentId !== 'string' || !UUID_PATTERN.test(paymentId)) {
    return NextResponse.json({ error: '결제 정보가 올바르지 않습니다.' }, { status: 400 })
  }

  const result = await verifyAndRecordPayment(supabase, paymentId, user.id)

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status })
  }
  return NextResponse.json(
    { payment: result.receipt },
    { status: result.created ? 201 : 200 }
  )
}
