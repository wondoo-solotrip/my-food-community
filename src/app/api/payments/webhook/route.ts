import { NextResponse } from 'next/server'
import { Webhook } from '@portone/server-sdk'

import { createAdminClient } from '@/lib/supabase/admin'
import { UUID_PATTERN } from '../../events/shared'
import { verifyAndRecordCancel, verifyAndRecordPayment } from '../shared'

/**
 * 포트원 결제·취소 웹훅(BFF) — 규칙: rules/payment.md (SSOT).
 *
 * 시그니처 검증(Webhook.verify)을 통과한 Transaction.Paid(결제)·
 * Transaction.Cancelled(전액 취소) 이벤트만 처리한다. 웹훅 body는 신뢰하지
 * 않는다 — paymentId만 꺼내 각각 완료 API·취소 API와 공용 경로인
 * verifyAndRecordPayment·verifyAndRecordCancel로 포트원 단건 조회 재검증 후
 * insert-only로 원장에 기록한다. 세션이 없는 서버 간 호출이라 service-role
 * 클라이언트로 기록한다.
 */
export async function POST(request: Request) {
  const secret = process.env.PORTONE_V2_WEBHOOK_SECRET
  if (!secret || !process.env.SUPABASE_SECRET_KEY) {
    return NextResponse.json(
      {
        error:
          '웹훅 설정이 없습니다. PORTONE_V2_WEBHOOK_SECRET·SUPABASE_SECRET_KEY를 설정해주세요.',
      },
      { status: 500 }
    )
  }

  // 시그니처 검증에는 파싱 전 원문(raw body)이 필요하다.
  const body = await request.text()
  let webhook: Webhook.Webhook
  try {
    webhook = await Webhook.verify(secret, body, Object.fromEntries(request.headers))
  } catch (e) {
    if (
      e instanceof Webhook.WebhookVerificationError ||
      e instanceof Webhook.InvalidInputError
    ) {
      return NextResponse.json({ error: '웹훅 검증에 실패했습니다.' }, { status: 400 })
    }
    throw e
  }

  // 부분 취소는 전액 환불 정책상 받지 않는 것이 정상이다 — 정책과 어긋난
  // 신호이므로 로그만 남기고 200으로 끝낸다(재시도해도 같다).
  if (webhook.type === 'Transaction.PartialCancelled') {
    console.warn(
      `[payments/webhook] 부분 취소 웹훅 수신 — 전액 환불 정책과 불일치 paymentId=${webhook.data.paymentId}`
    )
    return NextResponse.json({ ok: true, ignored: true })
  }

  // 결제 승인·전액 취소 이벤트만 처리한다. 그 외와 알 수 없는 타입은 에러 없이
  // 무시한다 — 포트원은 예고 없이 새 타입을 추가할 수 있다.
  if (webhook.type !== 'Transaction.Paid' && webhook.type !== 'Transaction.Cancelled') {
    return NextResponse.json({ ok: true, ignored: true })
  }

  // 웹훅의 paymentId가 원장 transaction_key다. 우리 결제는 항상 UUID로
  // 채번하므로(rules/payment.md) 다른 형식은 우리 주문이 아니다 — 무시한다.
  const { paymentId } = webhook.data
  if (!UUID_PATTERN.test(paymentId)) {
    return NextResponse.json({ ok: true, ignored: true })
  }

  const supabase = createAdminClient()
  const result =
    webhook.type === 'Transaction.Paid'
      ? await verifyAndRecordPayment(supabase, paymentId, null)
      : await verifyAndRecordCancel(supabase, paymentId)

  if (result.ok) {
    return NextResponse.json({ ok: true }, { status: result.created ? 201 : 200 })
  }

  // 일시 오류(5xx)만 5xx로 응답해 포트원 재전송(최대 5회)을 유도한다. 검증
  // 거절은 재시도해도 같으므로 200으로 종료하고 로그만 남긴다 — 이미 승인된
  // 결제가 거절된 경우 수동 환불 대상이다.
  if (result.status >= 500) {
    return NextResponse.json({ error: result.error }, { status: 500 })
  }
  console.warn(
    `[payments/webhook] 기록 거절 paymentId=${paymentId} (${result.status}): ${result.error}`
  )
  return NextResponse.json({ ok: false, reason: result.error })
}
