@AGENTS.md

# Design SSOT

- Storybook이 디자인 SSOT다.
- 모든 UI 작업 시 스토리북의 스토리(컴포넌트)를 가져다 재사용한다.
- 스토리에 없는 UI가 필요하면 스토리를 먼저 추가한 뒤 사용한다.
- 컴포넌트/스토리: `src/components/` (배럴: `src/components/index.ts`)
- 토큰(색상·타이포·간격·아이콘): `src/foundation/`

# Supabase BFF 규칙

- 모든 Supabase API 호출은 Next.js BFF(Route Handler, `src/app/api/`)를 통해서만 구현한다.
- 클라이언트 컴포넌트에서 supabase-js로 Supabase에 직접 접근하지 않는다. 클라이언트는 `/api/*` 엔드포인트만 호출한다.
- Supabase 키·시크릿은 서버 전용 환경변수로만 사용하고, `NEXT_PUBLIC_` 접두사로 노출하지 않는다.
- Supabase 클라이언트 생성은 서버 코드(Route Handler, Server Action, 서버 유틸)에서만 한다.
- 서버 클라이언트는 `src/lib/supabase/server.ts`의 `createClient()`를 재사용한다(요청마다 새로 생성됨).
- 세션 갱신은 `src/proxy.ts` → `src/lib/supabase/proxy.ts`(`updateSession`)가 담당한다. 이 파일들의 쿠키 처리 로직을 임의로 수정하지 않는다.

# 해상도 가이드

- 모바일 퍼스트, 태블릿·데스크톱까지 반응형으로 커버한다.
- 페이지 컬럼: `max-w-[1280px] mx-auto`, 1280px 초과 영역은 좌우 여백.
- 카드 그리드: `grid-cols-2 sm:grid-cols-3 xl:grid-cols-4`.
- 폼·본문은 가독 폭으로 중앙 정렬: 로그인 420px, 등록 640px, 상세 본문 720px.
