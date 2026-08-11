import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * 구글 OAuth 콜백(BFF). authorization code를 세션으로 교환해
 * 세션 쿠키를 심은 뒤 `next` 경로로 redirect한다.
 * 사용자가 동의를 취소했거나 code가 없으면 로그인 화면으로 되돌린다.
 */
export async function GET(request: Request) {
  const { origin, searchParams } = new URL(request.url)
  const code = searchParams.get('code')

  const rawNext = searchParams.get('next') ?? '/'
  const next = rawNext.startsWith('/') && !rawNext.startsWith('//') ? rawNext : '/'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      // 프록시/로드밸런서 뒤에서는 원래 host로 되돌려 보낸다.
      const forwardedHost = request.headers.get('x-forwarded-host')
      if (process.env.NODE_ENV === 'development') {
        return NextResponse.redirect(`${origin}${next}`)
      }
      if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`)
      }
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_failed`)
}
