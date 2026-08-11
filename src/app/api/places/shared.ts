import 'server-only'

import type { createClient } from '@/lib/supabase/server'

type ServerClient = Awaited<ReturnType<typeof createClient>>

export const BUCKET = 'place-image'
export const TITLE_MAX = 100
export const CONTENT_MIN = 10
export const CONTENT_MAX = 500
export const IMAGE_MAX_COUNT = 5
export const IMAGE_MAX_BYTES = 5 * 1024 * 1024
export const PLACE_NAME_MAX = 100
export const ADDRESS_MAX = 200

/**
 * 테이블에는 스토리지 파일 경로만 저장한다. 공개 URL은 서버 전용 환경변수
 * SUPABASE_STORAGE_URL로 조립해 내려주므로 클라이언트는 주소를 알 필요가 없다.
 */
export function toImageUrl(imagePath: string): string {
  return `${process.env.SUPABASE_STORAGE_URL}/${BUCKET}/${imagePath}`
}

interface PlaceImageRow {
  image_path: string
  sort_order: number
}

export interface PlaceListRow {
  id: string
  title: string
  content: string
  address: string
  created_at: string
  place_image: PlaceImageRow[] | null
}

/** 목록 행을 `PlaceSummary` JSON 모양으로 바꾼다. 대표 이미지는 첫 번째 사진이다. */
export function toPlaceSummary(place: PlaceListRow) {
  const images = place.place_image ?? []
  return {
    id: place.id,
    title: place.title,
    content: place.content,
    address: place.address,
    createdAt: place.created_at,
    imageUrl: images[0] ? toImageUrl(images[0].image_path) : null,
    imageCount: images.length,
  }
}

export interface PlaceFields {
  title: string
  content: string
  /** 지도에서 고른 장소명 — DB `name` 컬럼에 저장한다. */
  name: string
  /** 지번 주소 — 지도 확정 시 리버스 지오코딩이 채운 값. DB `address`. */
  address: string
  /** 지도 핀 좌표(WGS84) — DB `lat`/`lng`. */
  lat: number
  lng: number
}

/** formData의 좌표 값을 WGS84 도(deg) 숫자로 파싱한다. 범위를 벗어나면 null. */
function parseCoordinate(entry: FormDataEntryValue | null, max: number): number | null {
  if (typeof entry !== 'string' || !entry.trim()) return null
  const value = Number(entry)
  if (!Number.isFinite(value) || Math.abs(value) > max) return null
  return value
}

/**
 * 제목(필수)·내용(필수, 10자 이상)과 지도 정보(placeName·address·lat·lng, 모두
 * 필수) 검증. 지도 정보가 하나라도 없으면 등록·수정을 막는다.
 * 실패하면 사용자에게 보여줄 메시지를 돌려준다.
 */
export function parseFields(
  formData: FormData
): { fields: PlaceFields; error?: never } | { fields?: never; error: string } {
  const titleEntry = formData.get('title')
  const contentEntry = formData.get('content')
  const placeNameEntry = formData.get('placeName')
  const addressEntry = formData.get('address')
  const title = typeof titleEntry === 'string' ? titleEntry.trim() : ''
  const content = typeof contentEntry === 'string' ? contentEntry.trim() : ''
  const name = typeof placeNameEntry === 'string' ? placeNameEntry.trim() : ''
  const address = typeof addressEntry === 'string' ? addressEntry.trim() : ''
  const lat = parseCoordinate(formData.get('lat'), 90)
  const lng = parseCoordinate(formData.get('lng'), 180)

  if (!title) return { error: '맛집 이름을 입력해주세요.' }
  if (title.length > TITLE_MAX) {
    return { error: `맛집 이름은 ${TITLE_MAX}자 이하로 입력해주세요.` }
  }
  if (content.length < CONTENT_MIN) {
    return { error: `맛집 내용을 ${CONTENT_MIN}자 이상 입력해주세요.` }
  }
  if (content.length > CONTENT_MAX) {
    return { error: `맛집 내용은 ${CONTENT_MAX}자 이하로 입력해주세요.` }
  }
  if (!name) return { error: '지도에서 장소를 입력해주세요.' }
  if (name.length > PLACE_NAME_MAX) {
    return { error: `장소명은 ${PLACE_NAME_MAX}자 이하로 입력해주세요.` }
  }
  if (!address) {
    return { error: '장소의 주소가 없습니다. 지도에서 위치를 다시 확정해주세요.' }
  }
  if (address.length > ADDRESS_MAX) {
    return { error: '주소가 너무 깁니다. 장소를 다시 선택해주세요.' }
  }
  if (lat === null || lng === null) {
    return { error: '장소의 지도 좌표가 없습니다. 지도에서 위치를 다시 확정해주세요.' }
  }
  return { fields: { title, content, name, address, lat, lng } }
}

/**
 * images 필드의 파일 검증. 등록은 1장 이상 필수(required), 수정은 0장이면
 * 기존 사진 유지를 뜻하므로 빈 배열을 허용한다.
 */
export function parseImages(
  formData: FormData,
  { required }: { required: boolean }
): { images: File[]; error?: never } | { images?: never; error: string } {
  const images = formData
    .getAll('images')
    .filter((entry): entry is File => entry instanceof File && entry.size > 0)

  if (images.length === 0) {
    return required ? { error: '사진을 1장 이상 올려주세요.' } : { images: [] }
  }
  if (images.length > IMAGE_MAX_COUNT) {
    return { error: `사진은 최대 ${IMAGE_MAX_COUNT}장까지 올릴 수 있어요.` }
  }
  for (const image of images) {
    if (!image.type.startsWith('image/')) {
      return { error: '이미지 파일만 업로드할 수 있습니다.' }
    }
    if (image.size > IMAGE_MAX_BYTES) {
      return { error: '이미지는 5MB 이하만 업로드할 수 있습니다.' }
    }
  }
  return { images }
}

/**
 * place-image 버킷에 uuid v4 파일명으로 업로드하고 경로 목록을 돌려준다.
 * 하나라도 실패하면 성공한 파일을 지우고 null을 돌려준다.
 */
export async function uploadImages(
  supabase: ServerClient,
  images: File[]
): Promise<string[] | null> {
  const results = await Promise.all(
    images.map(async (image) => {
      const fileName = crypto.randomUUID()
      const { error } = await supabase.storage
        .from(BUCKET)
        .upload(fileName, image, { contentType: image.type })
      return error ? null : fileName
    })
  )

  const uploaded = results.filter((path): path is string => path !== null)
  if (uploaded.length !== images.length) {
    if (uploaded.length > 0) {
      await supabase.storage.from(BUCKET).remove(uploaded)
    }
    return null
  }
  return uploaded
}
