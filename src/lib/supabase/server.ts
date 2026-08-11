import 'server-only'

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * 서버 전용 Supabase 클라이언트.
 * Route Handler(BFF)·Server Action·서버 유틸에서만 사용한다.
 * 요청마다 새로 생성해야 하며, 전역으로 공유하면 안 된다.
 */
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Server Component에서는 쿠키를 쓸 수 없다.
            // 세션 갱신은 src/proxy.ts(updateSession)가 담당하므로 무시해도 안전하다.
          }
        },
      },
    }
  )
}
