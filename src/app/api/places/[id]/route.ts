import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

import { BUCKET, parseFields, parseImages, toImageUrl, uploadImages } from '../shared'

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

interface ImageRow {
  image_path: string
  sort_order: number
}

interface ExistingImageRow extends ImageRow {
  id: string
}

function notFound() {
  return NextResponse.json({ error: '맛집을 찾을 수 없습니다.' }, { status: 404 })
}

/** 맛집 상세 조회(BFF). 사진은 업로드 순서대로 내려주고, 소프트삭제된 글은 404다. */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  if (!UUID_PATTERN.test(id)) return notFound()

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: place, error } = await supabase
    .from('place')
    .select(
      'id, title, content, address, name, lat, lng, created_at, user_id, place_image(image_path, sort_order)'
    )
    .eq('id', id)
    .is('deleted_at', null)
    .order('sort_order', { referencedTable: 'place_image', ascending: true })
    .maybeSingle()

  if (error) {
    return NextResponse.json({ error: '맛집 정보를 불러오지 못했습니다.' }, { status: 500 })
  }
  if (!place) return notFound()

  const images: ImageRow[] = place.place_image ?? []
  return NextResponse.json({
    place: {
      id: place.id,
      title: place.title,
      content: place.content,
      address: place.address,
      placeName: place.name,
      lat: place.lat,
      lng: place.lng,
      createdAt: place.created_at,
      imageUrls: images.map((image) => toImageUrl(image.image_path)),
      isOwner: user?.id === place.user_id,
    },
  })
}

/**
 * 맛집 수정(BFF). 본인이 등록한 글만 고칠 수 있다. multipart/form-data로
 * title·content와 지도 정보(placeName·address·lat·lng, 모두 필수)를 받는다 —
 * 지도 정보가 하나라도 빠지면 400으로 막는다. images에 새 사진이 오면 기존
 * 사진 전체를 교체하며 없으면 기존 사진을 유지한다(교체 후에도 1장 이상
 * 규칙이 지켜진다). 폼은 장소 필드를 항상 현재 선택값으로 보내므로 그대로
 * 덮어쓴다.
 */
export async function PUT(
  request: Request,
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

  const { data: existing, error: existingError } = await supabase
    .from('place')
    .select('id, user_id, place_image(id, image_path, sort_order)')
    .eq('id', id)
    .is('deleted_at', null)
    .order('sort_order', { referencedTable: 'place_image', ascending: true })
    .maybeSingle()

  if (existingError) {
    return NextResponse.json({ error: '맛집 정보를 불러오지 못했습니다.' }, { status: 500 })
  }
  if (!existing) return notFound()
  if (existing.user_id !== user.id) {
    return NextResponse.json(
      { error: '본인이 등록한 맛집만 수정할 수 있습니다.' },
      { status: 403 }
    )
  }

  const formData = await request.formData()
  const fieldsResult = parseFields(formData)
  if (fieldsResult.error !== undefined) {
    return NextResponse.json({ error: fieldsResult.error }, { status: 400 })
  }
  const imagesResult = parseImages(formData, { required: false })
  if (imagesResult.error !== undefined) {
    return NextResponse.json({ error: imagesResult.error }, { status: 400 })
  }

  // 새 사진을 먼저 올리고 행을 추가한 뒤에야 기존 사진을 지운다.
  // 중간에 실패해도 기존 사진 1장 이상이 그대로 남는다.
  let newPaths: string[] | null = null
  if (imagesResult.images.length > 0) {
    newPaths = await uploadImages(supabase, imagesResult.images)
    if (!newPaths) {
      return NextResponse.json({ error: '이미지 업로드에 실패했습니다.' }, { status: 500 })
    }

    const { error: imageInsertError } = await supabase.from('place_image').insert(
      newPaths.map((path, index) => ({
        place_id: id,
        image_path: path,
        sort_order: index,
      }))
    )
    if (imageInsertError) {
      await supabase.storage.from(BUCKET).remove(newPaths)
      return NextResponse.json({ error: '맛집 수정에 실패했습니다.' }, { status: 500 })
    }
  }

  const { title, content, name, address, lat, lng } = fieldsResult.fields
  const { data: place, error: updateError } = await supabase
    .from('place')
    .update({ title, content, name, address, lat, lng })
    .eq('id', id)
    .select('id, title, content, address, name, lat, lng, created_at')
    .single()

  if (updateError || !place) {
    if (newPaths) {
      await supabase.from('place_image').delete().eq('place_id', id).in('image_path', newPaths)
      await supabase.storage.from(BUCKET).remove(newPaths)
    }
    return NextResponse.json({ error: '맛집 수정에 실패했습니다.' }, { status: 500 })
  }

  const previousImages: ExistingImageRow[] = existing.place_image ?? []
  if (newPaths && previousImages.length > 0) {
    // 교체가 끝난 뒤의 정리라 실패해도 수정 결과에는 영향이 없다.
    await supabase
      .from('place_image')
      .delete()
      .in('id', previousImages.map((image) => image.id))
    await supabase.storage.from(BUCKET).remove(previousImages.map((image) => image.image_path))
  }

  const imageUrls = (newPaths ?? previousImages.map((image) => image.image_path)).map(toImageUrl)
  return NextResponse.json({
    place: {
      id: place.id,
      title: place.title,
      content: place.content,
      address: place.address,
      placeName: place.name,
      lat: place.lat,
      lng: place.lng,
      createdAt: place.created_at,
      imageUrls,
    },
  })
}

/**
 * 맛집 삭제(BFF). 본인이 등록한 글만 지울 수 있다. 행을 지우는 대신
 * deleted_at을 채우는 소프트삭제라, 사진 파일과 데이터는 그대로 남고
 * 목록·상세·수정 조회에서만 빠진다.
 */
export async function DELETE(
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

  const { data: existing, error: existingError } = await supabase
    .from('place')
    .select('id, user_id')
    .eq('id', id)
    .is('deleted_at', null)
    .maybeSingle()

  if (existingError) {
    return NextResponse.json({ error: '맛집 정보를 불러오지 못했습니다.' }, { status: 500 })
  }
  if (!existing) return notFound()
  if (existing.user_id !== user.id) {
    return NextResponse.json(
      { error: '본인이 등록한 맛집만 삭제할 수 있습니다.' },
      { status: 403 }
    )
  }

  const { error: deleteError } = await supabase
    .from('place')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)
    .is('deleted_at', null)

  if (deleteError) {
    return NextResponse.json({ error: '맛집 삭제에 실패했습니다.' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
