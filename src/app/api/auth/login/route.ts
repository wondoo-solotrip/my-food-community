import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * 구글 OAuth 시작점(BFF). 브라우저가 이 URL로 전체 페이지 이동하면
 * PKCE code verifier 쿠키를 심은 뒤 구글 동의 화면으로 redirect한다.
 * 로그인 완료 후 돌아올 경로는 `next` 쿼리로 전달한다. (기본 `/`)
 */
export async function GET(request: Request) {
  const { origin, searchParams } = new URL(request.url)

  // open redirect 방지: 내부 경로만 허용한다.
  const rawNext = searchParams.get('next') ?? '/'
  const next = rawNext.startsWith('/') && !rawNext.startsWith('//') ? rawNext : '/'

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${origin}/api/auth/callback?next=${encodeURIComponent(next)}`,
    },
  })

  if (error || !data.url) {
    return NextResponse.redirect(`${origin}/login?error=oauth_start_failed`)
  }

  return NextResponse.redirect(data.url)
}
