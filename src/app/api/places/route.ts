import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

import {
  BUCKET,
  parseFields,
  parseImages,
  toImageUrl,
  toPlaceSummary,
  uploadImages,
} from './shared'

/** 맛집 목록 조회(BFF). 최신 등록순이고, 소프트삭제된 글은 제외한다. */
export async function GET() {
  const supabase = await createClient()

  const { data: places, error } = await supabase
    .from('place')
    .select('id, title, content, address, created_at, place_image(image_path, sort_order)')
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .order('sort_order', { referencedTable: 'place_image', ascending: true })

  if (error) {
    return NextResponse.json({ error: '맛집 목록을 불러오지 못했습니다.' }, { status: 500 })
  }

  return NextResponse.json({ places: places.map(toPlaceSummary) })
}

/**
 * 맛집 등록(BFF). multipart/form-data로 title(필수), content(필수, 10자 이상),
 * images(1장 이상)와 지도 정보(placeName·address·lat·lng, 모두 필수)를 받는다.
 * 지도 정보가 하나라도 빠지면 400으로 막는다. 사진은 place-image 버킷에
 * uuid v4 파일명으로 올리고, 테이블에는 경로만 저장한다. 지도 정보는
 * `name`(장소명)·`address`(지번 주소)·`lat`·`lng` 컬럼에 저장한다.
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

  const formData = await request.formData()
  const fieldsResult = parseFields(formData)
  if (fieldsResult.error !== undefined) {
    return NextResponse.json({ error: fieldsResult.error }, { status: 400 })
  }
  const imagesResult = parseImages(formData, { required: true })
  if (imagesResult.error !== undefined) {
    return NextResponse.json({ error: imagesResult.error }, { status: 400 })
  }

  const paths = await uploadImages(supabase, imagesResult.images)
  if (!paths) {
    return NextResponse.json({ error: '이미지 업로드에 실패했습니다.' }, { status: 500 })
  }

  const { title, content, name, address, lat, lng } = fieldsResult.fields
  const { data: place, error: insertError } = await supabase
    .from('place')
    .insert({ user_id: user.id, title, content, name, address, lat, lng })
    .select('id, title, content, address, name, lat, lng, created_at')
    .single()

  if (insertError || !place) {
    await supabase.storage.from(BUCKET).remove(paths)
    return NextResponse.json({ error: '맛집 등록에 실패했습니다.' }, { status: 500 })
  }

  const { error: imageInsertError } = await supabase.from('place_image').insert(
    paths.map((path, index) => ({
      place_id: place.id,
      image_path: path,
      sort_order: index,
    }))
  )

  if (imageInsertError) {
    // 사진 없는 글이 남지 않게 방금 만든 행과 업로드 파일을 정리한다.
    await supabase.from('place').delete().eq('id', place.id)
    await supabase.storage.from(BUCKET).remove(paths)
    return NextResponse.json({ error: '맛집 등록에 실패했습니다.' }, { status: 500 })
  }

  return NextResponse.json(
    {
      place: {
        id: place.id,
        title: place.title,
        content: place.content,
        address: place.address,
        placeName: place.name,
        lat: place.lat,
        lng: place.lng,
        createdAt: place.created_at,
        imageUrls: paths.map(toImageUrl),
      },
    },
    { status: 201 }
  )
}
