import { NextResponse } from 'next/server'

/**
 * 장소 검색(BFF) — 네이버 지역 검색 API(네이버 API 허브) 프록시. 디자인 08의
 * "네이버 검색 결과" 목록이 이 응답을 그린다. 키는 서버 전용 환경변수
 * (NAVER_CLIENT_ID/SECRET)로만 쓰고 클라이언트에는 정리된 결과만 내려준다.
 * https://api.ncloud-docs.com/docs/naver-api-hub-search-local
 *
 * 키가 없거나 네이버 호출이 실패하면 503을 돌려주고, 화면은 결과 없음(09)
 * 상태로 떨어져 장소명 직접 입력 흐름을 계속 쓸 수 있다.
 */

const NAVER_LOCAL_SEARCH_URL = 'https://naverapihub.apigw.ntruss.com/search/v1/local'
const QUERY_MAX = 100
// 독스 기준 display는 1~5.
const DISPLAY_COUNT = 5

interface NaverLocalItem {
  title?: string
  roadAddress?: string
  address?: string
  /** WGS84 경도(x) 문자열. */
  mapx?: string
  /** WGS84 위도(y) 문자열. */
  mapy?: string
}

/**
 * 네이버 mapx/mapy를 WGS84 도(deg) 단위 lat/lng 숫자로 변환한다. 독스의 예시는
 * 자리 표시자뿐이라 실 응답의 두 형식을 모두 받는다 — 소수점 도("127.05…")는
 * 그대로, ×10⁷ 정수("1270585023")는 나눠서 도 단위로 맞춘다.
 */
function toCoordinate(raw: string | undefined): number | undefined {
  if (!raw) return undefined
  const value = Number(raw)
  if (!Number.isFinite(value)) return undefined
  return Math.abs(value) > 1000 ? value / 1e7 : value
}

/** 네이버가 title에 끼워 보내는 <b> 강조 태그와 HTML 엔티티를 걷어낸다. */
function cleanTitle(title: string): string {
  return title
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim()
}

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams.get('query')?.trim() ?? ''
  if (!query) {
    return NextResponse.json({ error: '검색어를 입력해주세요.' }, { status: 400 })
  }
  if (query.length > QUERY_MAX) {
    return NextResponse.json({ error: '검색어가 너무 깁니다.' }, { status: 400 })
  }

  const clientId = process.env.NAVER_CLIENT_ID
  const clientSecret = process.env.NAVER_CLIENT_SECRET
  if (!clientId || !clientSecret) {
    return NextResponse.json(
      { error: '장소 검색이 설정되지 않았습니다. 장소명 직접 입력을 이용해주세요.' },
      { status: 503 }
    )
  }

  const url = `${NAVER_LOCAL_SEARCH_URL}?query=${encodeURIComponent(query)}&display=${DISPLAY_COUNT}`
  let data: { items?: NaverLocalItem[] }
  try {
    const res = await fetch(url, {
      headers: {
        'X-NCP-APIGW-API-KEY-ID': clientId,
        'X-NCP-APIGW-API-KEY': clientSecret,
      },
    })
    if (!res.ok) {
      return NextResponse.json({ error: '장소 검색에 실패했습니다.' }, { status: 502 })
    }
    data = await res.json()
  } catch {
    return NextResponse.json({ error: '장소 검색에 실패했습니다.' }, { status: 502 })
  }

  const results = (data.items ?? [])
    .map((item) => ({
      name: cleanTitle(item.title ?? ''),
      roadAddress: item.roadAddress?.trim() ?? '',
      jibunAddress: item.address?.trim() ?? '',
      // 좌표는 지도 센터 이동용 — 없어도 목록·등록 흐름은 그대로 동작한다.
      lat: toCoordinate(item.mapy),
      lng: toCoordinate(item.mapx),
    }))
    // 선택 시 폼으로 넘어가는 건 지번 주소라, 장소명·지번 주소가 있어야 한다.
    .filter((item) => item.name && item.jibunAddress)

  return NextResponse.json({ results })
}
