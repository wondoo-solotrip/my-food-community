import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

import { toPlaceSummary } from '../../places/shared'

/** 내가 쓴 맛집 목록 조회(BFF). 최신 등록순이고, 소프트삭제된 글은 제외한다. */
export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
  }

  const { data: places, error: listError } = await supabase
    .from('place')
    .select('id, title, content, address, created_at, place_image(image_path, sort_order)')
    .eq('user_id', user.id)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .order('sort_order', { referencedTable: 'place_image', ascending: true })

  if (listError) {
    return NextResponse.json({ error: '내가 쓴 글을 불러오지 못했습니다.' }, { status: 500 })
  }

  return NextResponse.json({ places: places.map(toPlaceSummary) })
}
