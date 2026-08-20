import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

import { PRODUCT_COLUMNS, toEventSummary } from './shared'

/**
 * 메인 배너 모임 조회(BFF). 공개(Public) 상품 중 가장 최근 것 하나를 내려준다.
 * 공개 상품이 없으면 `event: null` — 화면은 배너를 그리지 않는다.
 */
export async function GET() {
  const supabase = await createClient()

  const { data: product, error } = await supabase
    .from('product')
    .select(PRODUCT_COLUMNS)
    .eq('status', 'Public')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) {
    return NextResponse.json({ error: '모임 정보를 불러오지 못했습니다.' }, { status: 500 })
  }

  return NextResponse.json({ event: product ? toEventSummary(product) : null })
}
