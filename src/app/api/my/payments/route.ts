import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

import {
  toPaymentReceipt,
  type PaymentRowWithSnapshot,
} from '../../events/shared'

/**
 * 내 결제·취소 내역 조회(BFF) — 마이페이지 결제 내역·취소 내역 탭이 쓴다.
 * 원장에서 취소되지 않은 결제(type='PAYMENT', 같은 transaction_key의 CANCEL
 * 없음)는 `payments`로, 취소 행은 `canceled`로 나눠 내려준다. 표기는 모두
 * 결제 시점 스냅샷 기준이다.
 */
export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
  }

  const { data, error: listError } = await supabase
    .from('payment')
    .select('id, created_at, amount, type, transaction_key, payment_snapshot(snapshot_product)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (listError) {
    return NextResponse.json({ error: '결제 내역을 불러오지 못했습니다.' }, { status: 500 })
  }

  const rows = (data ?? []) as unknown as PaymentRowWithSnapshot[]
  const canceledKeys = new Set(
    rows.filter((row) => row.type === 'CANCEL').map((row) => row.transaction_key)
  )

  const payments = rows
    .filter((row) => row.type === 'PAYMENT' && !canceledKeys.has(row.transaction_key))
    .map(toPaymentReceipt)

  const canceled = rows
    .filter((row) => row.type === 'CANCEL')
    .map((row) => ({
      id: row.id,
      // 원장의 CANCEL 행은 −부호(rules/payment.md) — 환불 금액 표기는 절댓값.
      amount: Math.abs(Number(row.amount)),
      canceledAt: row.created_at,
      eventName: row.payment_snapshot?.snapshot_product.name ?? '',
    }))

  return NextResponse.json({ payments, canceled })
}
