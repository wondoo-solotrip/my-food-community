import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const BUCKET = 'profile-image'
const NICKNAME_MAX = 20
const IMAGE_MAX_BYTES = 5 * 1024 * 1024

/**
 * 테이블에는 스토리지 파일 경로만 저장한다. 공개 URL은 서버 전용 환경변수
 * SUPABASE_STORAGE_URL로 조립해 내려주므로 클라이언트는 주소를 알 필요가 없다.
 */
function toImageUrl(imagePath: string | null): string | null {
  if (!imagePath) return null
  return `${process.env.SUPABASE_STORAGE_URL}/${BUCKET}/${imagePath}`
}

/** 현재 로그인한 사용자의 프로필 조회(BFF). 아직 만든 적 없으면 profile: null. */
export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    return NextResponse.json({ profile: null }, { status: 401 })
  }

  const { data: profile, error: profileError } = await supabase
    .from('profile')
    .select('nickname, image_path')
    .eq('user_id', user.id)
    .maybeSingle()

  if (profileError) {
    return NextResponse.json({ error: '프로필을 불러오지 못했습니다.' }, { status: 500 })
  }

  return NextResponse.json({
    profile: profile
      ? { nickname: profile.nickname, imageUrl: toImageUrl(profile.image_path) }
      : null,
  })
}

/**
 * 프로필 생성·수정(BFF). multipart/form-data로 nickname(필수)과
 * image(선택)를 받는다. 이미지는 profile-image 버킷에 uuid v4 파일명으로
 * 올리고, 테이블에는 그 경로만 저장한다.
 */
export async function PUT(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
  }

  const formData = await request.formData()
  const nicknameEntry = formData.get('nickname')
  const imageEntry = formData.get('image')

  const nickname = typeof nicknameEntry === 'string' ? nicknameEntry.trim() : ''
  if (!nickname || nickname.length > NICKNAME_MAX) {
    return NextResponse.json(
      { error: `닉네임은 1~${NICKNAME_MAX}자로 입력해주세요.` },
      { status: 400 }
    )
  }

  const image = imageEntry instanceof File && imageEntry.size > 0 ? imageEntry : null
  if (image && !image.type.startsWith('image/')) {
    return NextResponse.json({ error: '이미지 파일만 업로드할 수 있습니다.' }, { status: 400 })
  }
  if (image && image.size > IMAGE_MAX_BYTES) {
    return NextResponse.json(
      { error: '이미지는 5MB 이하만 업로드할 수 있습니다.' },
      { status: 400 }
    )
  }

  // 기존 경로는 새 이미지가 없을 때 유지하고, 교체됐을 때 지우는 데 쓴다.
  const { data: existing } = await supabase
    .from('profile')
    .select('image_path')
    .eq('user_id', user.id)
    .maybeSingle()

  let imagePath = existing?.image_path ?? null
  if (image) {
    const fileName = crypto.randomUUID()
    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(fileName, image, { contentType: image.type })

    if (uploadError) {
      return NextResponse.json({ error: '이미지 업로드에 실패했습니다.' }, { status: 500 })
    }
    imagePath = fileName
  }

  const { data: profile, error: upsertError } = await supabase
    .from('profile')
    .upsert({ user_id: user.id, nickname, image_path: imagePath }, { onConflict: 'user_id' })
    .select('nickname, image_path')
    .single()

  if (upsertError || !profile) {
    // 방금 올린 파일이 고아로 남지 않게 정리한다. 정리 실패는 무시해도 안전하다.
    if (image && imagePath) {
      await supabase.storage.from(BUCKET).remove([imagePath])
    }
    return NextResponse.json({ error: '프로필 저장에 실패했습니다.' }, { status: 500 })
  }

  // 교체된 이전 이미지 삭제. 실패해도 프로필 저장 결과에는 영향이 없다.
  const previousPath = existing?.image_path ?? null
  if (image && previousPath && previousPath !== imagePath) {
    await supabase.storage.from(BUCKET).remove([previousPath])
  }

  return NextResponse.json({
    profile: { nickname: profile.nickname, imageUrl: toImageUrl(profile.image_path) },
  })
}
