import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * 로그아웃(BFF). 세션을 종료하고 인증 쿠키를 제거한다.
 * CSRF를 피하기 위해 POST만 허용한다.
 */
export async function POST() {
  const supabase = await createClient()
  const { error } = await supabase.auth.signOut()

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
