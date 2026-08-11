import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * 만료된 Auth 토큰을 갱신하고 갱신된 쿠키를 요청/응답 양쪽에 반영한다.
 * src/proxy.ts에서만 호출한다.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
          Object.entries(headers).forEach(([key, value]) =>
            supabaseResponse.headers.set(key, value)
          )
        },
      },
    }
  )

  // createServerClient와 getClaims() 사이에 다른 코드를 넣지 말 것.
  // getClaims()를 제거하면 세션 갱신이 끊겨 사용자가 무작위로 로그아웃될 수 있다.
  await supabase.auth.getClaims()

  // 페이지 보호가 필요해지면 여기서 claims 유무를 확인해 /login으로 redirect한다.
  // redirect 시에도 반드시 supabaseResponse의 쿠키를 복사해서 반환해야 한다.

  return supabaseResponse
}
