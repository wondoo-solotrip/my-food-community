import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * 현재 로그인한 사용자 조회(BFF). Auth 서버에서 검증된 사용자만 반환하며,
 * 클라이언트에는 화면에 필요한 최소 필드만 내려준다.
 */
export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    return NextResponse.json({ user: null }, { status: 401 })
  }

  const metadata = user.user_metadata as {
    name?: string
    full_name?: string
    avatar_url?: string
    picture?: string
  }

  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email ?? null,
      name: metadata.full_name ?? metadata.name ?? user.email?.split('@')[0] ?? '사용자',
      avatarUrl: metadata.avatar_url ?? metadata.picture ?? null,
    },
  })
}
