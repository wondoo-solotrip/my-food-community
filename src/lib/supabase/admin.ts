import 'server-only'

import { createClient as createSupabaseClient } from '@supabase/supabase-js'

/**
 * 서버 전용 service-role 클라이언트 — RLS를 우회한다.
 * 세션(쿠키) 없이 동작해야 하는 서버 간 BFF(포트원 결제 웹훅)에서만 쓴다.
 * 사용자 요청을 처리하는 BFF는 반드시 server.ts의 createClient()를 쓴다.
 */
export function createAdminClient() {
  return createSupabaseClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
    {
      auth: { autoRefreshToken: false, persistSession: false },
    }
  )
}
