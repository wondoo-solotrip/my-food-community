import { NextResponse } from 'next/server'

/**
 * 주소 조회(BFF) — 네이버 Reverse Geocoding API(NCP Maps) 프록시. 장소 등록
 * 지도(07)에서 지도를 움직일 때마다 중심 좌표의 지번 주소를 이 응답으로
 * 채운다. 키는 서버 전용 환경변수(NCP_MAP_CLIENT_ID/SECRET)로만 쓰고
 * 클라이언트에는 결합된 주소 문자열만 내려준다.
 * https://api.ncloud-docs.com/docs/en/application-maps-reversegeocoding
 *
 * 지번 주소(orders=addr)만 조회한다 — region(시도~리)과 land(번지)를 결합해
 * `경기도 성남시 분당구 정자동 178-1` 형태로 만든다. 산 지번(land.type "2")은
 * 번지 앞에 "산"을 붙인다.
 */

const NAVER_REVERSE_GEOCODE_URL = 'https://maps.apigw.ntruss.com/map-reversegeocode/v2/gc'

interface ReverseGeocodeArea {
  name?: string
}

interface ReverseGeocodeResult {
  name?: string
  region?: {
    area1?: ReverseGeocodeArea
    area2?: ReverseGeocodeArea
    area3?: ReverseGeocodeArea
    area4?: ReverseGeocodeArea
  }
  land?: {
    /** "1" 일반 지번, "2" 산 지번. */
    type?: string
    number1?: string
    number2?: string
  }
}

/** region 시도~리와 land 번지(본번-부번)를 지번 주소 한 줄로 결합한다. */
function buildJibunAddress(result: ReverseGeocodeResult): string {
  const { region, land } = result
  const parts = [region?.area1, region?.area2, region?.area3, region?.area4]
    .map((area) => area?.name?.trim())
    .filter((name): name is string => Boolean(name))

  const number1 = land?.number1?.trim() ?? ''
  const number2 = land?.number2?.trim() ?? ''
  const lot = number1 && number2 ? `${number1}-${number2}` : number1
  if (lot) parts.push(land?.type === '2' ? `산 ${lot}` : lot)

  return parts.join(' ')
}

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams
  const lat = Number(params.get('lat'))
  const lng = Number(params.get('lng'))
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) {
    return NextResponse.json({ error: '좌표가 올바르지 않습니다.' }, { status: 400 })
  }

  const clientId = process.env.NCP_MAP_CLIENT_ID
  const clientSecret = process.env.NCP_MAP_CLIENT_SECRET
  if (!clientId || !clientSecret) {
    return NextResponse.json({ error: '주소 조회가 설정되지 않았습니다.' }, { status: 503 })
  }

  // coords는 "경도,위도" 순서다.
  const url = `${NAVER_REVERSE_GEOCODE_URL}?coords=${lng},${lat}&orders=addr&output=json`
  let data: { status?: { code?: number }; results?: ReverseGeocodeResult[] }
  try {
    const res = await fetch(url, {
      headers: {
        'x-ncp-apigw-api-key-id': clientId,
        'x-ncp-apigw-api-key': clientSecret,
      },
    })
    if (!res.ok) {
      return NextResponse.json({ error: '주소 조회에 실패했습니다.' }, { status: 502 })
    }
    data = await res.json()
  } catch {
    return NextResponse.json({ error: '주소 조회에 실패했습니다.' }, { status: 502 })
  }

  // status.code 0이 정상, 3은 결과 없음(바다·국외 등).
  const addrResult =
    data.status?.code === 0
      ? (data.results ?? []).find((result) => result.name === 'addr')
      : undefined
  const address = addrResult ? buildJibunAddress(addrResult) : ''
  if (!address) {
    return NextResponse.json({ error: '주소를 찾을 수 없는 위치입니다.' }, { status: 404 })
  }

  return NextResponse.json({ address })
}
