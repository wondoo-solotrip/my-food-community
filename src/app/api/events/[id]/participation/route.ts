import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

import { UUID_PATTERN } from '../../shared'

interface LedgerRow {
  type: string
}

/**
 * 내 참여 여부 조회(BFF) — 결제창을 열기 전 중복 참여를 걸러내는 사전 점검.
 * 승인된 뒤에 거절하면 환불이 필요해지므로 결제 전에 확인한다(rules/payment.md).
 * 원장에서 취소되지 않은 결제(PAYMENT − CANCEL > 0)가 있으면 participated=true.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  if (!UUID_PATTERN.test(id)) {
    return NextResponse.json({ error: '모임 정보가 올바르지 않습니다.' }, { status: 400 })
  }

  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
  }

  const { data: ledger, error: ledgerError } = await supabase
    .from('payment')
    .select('type')
    .eq('user_id', user.id)
    .eq('product_id', id)

  if (ledgerError) {
    return NextResponse.json({ error: '결제 내역을 확인하지 못했습니다.' }, { status: 500 })
  }

  const rows: LedgerRow[] = ledger ?? []
  const activeCount =
    rows.filter((row) => row.type === 'PAYMENT').length -
    rows.filter((row) => row.type === 'CANCEL').length

  return NextResponse.json({ participated: activeCount > 0 })
}
