import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

import { PRODUCT_COLUMNS, UUID_PATTERN, toEventDetail } from '../shared'

function notFound() {
  return NextResponse.json({ error: '모임을 찾을 수 없습니다.' }, { status: 404 })
}

/**
 * 모임 상세 조회(BFF). 비로그인도 볼 수 있다. 참여 인원은 개인 결제 내역을
 * 노출하지 않도록 definer 함수(product_participant_count)로 집계만 받아온다.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  if (!UUID_PATTERN.test(id)) return notFound()

  const supabase = await createClient()

  const { data: product, error } = await supabase
    .from('product')
    .select(PRODUCT_COLUMNS)
    .eq('id', id)
    .eq('status', 'Public')
    .maybeSingle()

  if (error) {
    return NextResponse.json({ error: '모임 정보를 불러오지 못했습니다.' }, { status: 500 })
  }
  if (!product) return notFound()

  const { data: participantCount, error: countError } = await supabase.rpc(
    'product_participant_count',
    { target_product_id: id }
  )

  if (countError) {
    return NextResponse.json({ error: '참여 현황을 불러오지 못했습니다.' }, { status: 500 })
  }

  return NextResponse.json({
    event: toEventDetail(product, participantCount ?? 0),
  })
}
