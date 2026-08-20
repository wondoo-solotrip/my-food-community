# 결제 규칙 (SSOT)

모든 결제 관련 기능(결제 요청·검증·기록·취소·웹훅)의 단일 기준. 이 문서와 코드가
어긋나면 문서를 먼저 갱신한 뒤 코드를 맞춘다. 포트원 스펙은 포트원 MCP 도구
(`readPortoneV2FrontendCode`, `readPortoneV2BackendCode`, `readPortoneOpenapiSchema`)로
더블체크한다.

## 스택

- **포트원(PortOne) V2만 사용한다.** V1 API·SDK를 섞지 않는다.
- 프론트: `@portone/browser-sdk/v2`의 `PortOne.requestPayment` — 클라이언트
  컴포넌트에서만 호출.
- 서버: 포트원 REST API(`https://api.portone.io`)를 BFF(Route Handler)에서 직접
  호출. 인증 헤더는 `Authorization: PortOne {PORTONE_V2_API_SECRET}` —
  **Bearer 대신 `PortOne` 인증 스킴**.
- 웹훅 시그니처 검증: `@portone/server-sdk`의 `Webhook.verify`.
- Supabase 접근은 프로젝트 공통 BFF 규칙(CLAUDE.md)을 따른다 — 클라이언트에서
  supabase-js 직접 접근 금지.

## 환경변수

| 변수 | 노출 범위 | 용도 |
| --- | --- | --- |
| `NEXT_PUBLIC_PORTONE_STORE_ID` | 클라이언트 | 결제창 `storeId` |
| `NEXT_PUBLIC_PORTONE_CHANNEL_KEY` | 클라이언트 | 결제창 `channelKey` (카드 테스트 채널) |
| `PORTONE_V2_API_SECRET` | **서버 전용** | 결제 단건 조회·취소 등 포트원 API 호출 |
| `PORTONE_V2_WEBHOOK_SECRET` | **서버 전용** | 웹훅 시그니처 검증 (콘솔 웹훅 설정에서 발급) |
| `SUPABASE_SECRET_KEY` | **서버 전용** | 세션 없는 웹훅 BFF의 원장 기록(service-role) |

- Store ID·Channel Key는 결제창 호출용 공개 식별자라 `NEXT_PUBLIC_`을 허용한다.
- 그 외 모든 시크릿은 서버 전용 — `NEXT_PUBLIC_` 접두사·클라이언트 번들 포함 금지.

## 원장(`payment` 테이블) 규칙

- **insert-only(append-only).** UPDATE·DELETE 금지 — 상태 변화는 항상 행 추가로만
  표현한다. RLS도 INSERT·SELECT(본인 행)만 열려 있다.
- **`type` 컬럼으로 결제/취소를 구분한다**: 결제 `PAYMENT`, 취소 `CANCEL`.
- **`transaction_key`(uuid)가 그룹 키** — 포트원 `paymentId`를 그대로 쓴다.
  한 결제의 PAYMENT·CANCEL 행이 같은 `transaction_key`로 묶인다.
- **부호 규칙**: `amount`는 PAYMENT `+`, CANCEL `−`. 원장 어디서든 예외 없다
  (웹훅·수동 취소·추후 취소 웹훅 포함). 환불 금액 표기는 절댓값으로 변환한다.
- **중복 방어**: `(transaction_key, type)` 유니크 인덱스가 중복 결제 기록·중복
  취소를 DB에서 막는다(최후 방어선). 그 위에서 모든 기록 경로는 멱등 — 이미
  있으면 기존 행을 반환하고, insert 23505(유니크 위반)면 기존 행을 다시 읽는다.
- 참여 확정 여부는 파생값: `PAYMENT 행 수 − CANCEL 행 수 > 0`.
- **스냅샷** — 결제 시점 상품을 `payment_snapshot.snapshot_product`에, 포트원
  단건 조회 응답을 `payment_snapshot.snapshot_payment`에 동결한다. 영수증·내역
  화면은 스냅샷만 읽는다.
- 원장·스냅샷의 모든 쓰기는 BFF(Route Handler)에서만 한다. 세션이 있으면 RLS
  클라이언트(`src/lib/supabase/server.ts`), 세션 없는 웹훅은 service-role
  클라이언트(`src/lib/supabase/admin.ts`)를 쓴다.

## 결제 플로우 (단건결제 · CARD)

구현 위치: 결제창 `src/app/events/[id]/payment-sheet.tsx`, 검증·기록
`src/app/api/payments/complete/route.ts` + `src/app/api/payments/webhook/route.ts`
(공용 경로 `src/app/api/payments/shared.ts`의 `verifyAndRecordPayment`),
완료 화면 `src/app/payments/[id]/complete/`.

1. **[클라] 사전 점검** — 결제창 전에 `GET /api/auth/me`(로그인),
   `GET /api/events/[id]/participation`(중복 참여) 확인. 승인 후 거절은 환불이
   필요하므로 거절 사유는 최대한 결제창 전에 걸러낸다.
2. **[클라] paymentId 생성** — `crypto.randomUUID()`(UUID v4). 이 값이 원장
   `transaction_key`(uuid)로 그대로 저장된다.
3. **[클라] 결제창 호출** — `PortOne.requestPayment({ storeId, channelKey,
   paymentId, orderName: event.name, totalAmount: event.price, currency: 'KRW',
   payMethod: 'CARD', redirectUrl: ${origin}/payments/${paymentId}/complete,
   customData: { productId, userId } })`. `orderName`·`totalAmount`는 BFF가
   내려준 DB 값 — 클라 계산·수정 금지.
4. **[클라] 실패 처리** — 응답에 `code`가 있으면 실패. 바텀시트 안에서 `message`
   를 보여주고 페이지 이동하지 않는다.
5. **[클라] 완료 페이지 이동** — `/payments/{paymentId}/complete`. 모바일
   리디렉션 플로우도 같은 URL로 복귀한다(`code` 쿼리가 있으면 실패).
6. **[서버] 검증·기록** — 완료 페이지가 `POST /api/payments/complete
   { paymentId }` 호출. 웹훅(`Transaction.Paid`)도 같은 검증·기록 경로를 탄다 —
   클라이언트 응답 유실 시 웹훅이 원장을 채운다.

## 서버 검증 공용 경로 (`verifyAndRecordPayment`)

완료 API와 웹훅이 반드시 이 함수 하나로 검증·기록한다. 신뢰 입력은
`paymentId`(= `transaction_key`) 하나뿐 — **금액·상품 정보를 클라이언트 입력으로
받는 결제 API를 만들지 않는다.** 검증 순서:

1. **멱등(중복 결제 검증)** — `(transaction_key = paymentId, type = 'PAYMENT')`
   원장이 이미 있으면 그 영수증을 그대로 반환한다.
2. 포트원 **결제 단건 조회** `GET /payments/{paymentId}` — `status !== 'PAID'`면
   기록하지 않는다.
3. **채널 검증** — `payment.channel.key === NEXT_PUBLIC_PORTONE_CHANNEL_KEY`
   (채널 바꿔치기 방지).
4. `customData.productId`로 DB 상품 재조회(`status = 'Public'`). customData는
   힌트일 뿐 **신뢰하지 않는다** — 검증은 전부 DB 값으로.
5. **금액 검증** — `amount.total === Number(product.price)`,
   `currency === 'KRW'`, `orderName === product.name`. 하나라도 다르면 위·변조로
   보고 거부.
6. **본인 확인** — 완료 API는 `customData.userId === 세션 사용자 id`(403).
   웹훅은 세션이 없으므로 `customData.userId`(UUID)를 기록 대상으로 쓴다 —
   `auth.users` FK가 실존을 보장한다.
7. 비즈니스 검증 — 본인 1자리(PAYMENT − CANCEL 계산), 남은 자리
   (`product_participant_count` RPC).
8. 스냅샷 insert → 원장 insert(`amount` +). 23505면 기존 행을 읽어 멱등 반환.

검증 실패 시 기록하지 않는다. **이미 승인된 결제가 2~7에서 거절되면 환불이
필요하다** — 자동 환불은 미구현(알려진 한계)이라 콘솔에서 수동 취소한다.

## 웹훅 (`POST /api/payments/webhook`)

- **시그니처 검증 필수** — 파싱 전 원문(raw body)으로 `@portone/server-sdk`
  `Webhook.verify(PORTONE_V2_WEBHOOK_SECRET, body, headers)`. 실패 시 400.
- **웹훅 body를 신뢰하지 않는다** — `data.paymentId`만 꺼내
  `verifyAndRecordPayment`로 단건 조회 재검증 후 기록한다.
- `transaction_key` = 웹훅의 `paymentId`. UUID 형식이 아니면 우리 주문이 아니다
  — 무시(200).
- **타입 처리**: `Transaction.Paid`는 결제 기록(`verifyAndRecordPayment`),
  `Transaction.Cancelled`는 취소 기록(`verifyAndRecordCancel`) 경로를 탄다.
  그 외·알 수 없는 타입은 에러 없이 200으로 무시한다(포트원은 예고 없이
  타입을 추가할 수 있다).
- **응답 정책**: 일시 오류(DB·포트원 API 장애)만 5xx로 응답해 포트원 재전송
  (최대 5회, exponential backoff)을 유도한다. 검증 거절(금액 불일치·정원 초과
  등)은 재시도해도 같으므로 200 + 로그로 종료한다 — 승인된 결제라면 수동 환불
  대상이다.
- 원장 기록은 service-role 클라이언트(`SUPABASE_SECRET_KEY`)로 한다 — RLS
  INSERT 정책이 authenticated 전용이라 세션 없는 웹훅은 우회가 필요하다.
- 콘솔에 웹훅 URL(`/api/payments/webhook`)을 등록한다 — HTTPS만 허용, 웹훅
  버전 [결제모듈 V2] · 최신 스키마(2024-04-25).
- 완료 API와 웹훅이 경합해도 안전하다 — 멱등 + `(transaction_key, type)` 유니크.

### 취소 웹훅 (`Transaction.Cancelled`)

- 같은 엔드포인트에서 `Transaction.Cancelled`를 처리한다(부분 취소
  `Transaction.PartialCancelled`는 전액 환불 정책상 받지 않는 것이 정상 — 수신
  시 로그 후 200).
- 처리 규칙은 결제 웹훅과 동일: 시그니처 검증 → 단건 조회로 상태
  (`CANCELLED`) 재검증 → insert-only로 `type='CANCEL'` 행 추가. 구현은 취소
  API와 공용 경로인 `verifyAndRecordCancel`(`src/app/api/payments/shared.ts`).
- `transaction_key`는 웹훅의 `paymentId` 그대로 — 원 PAYMENT 행과 같은 키로
  묶는다. 원 PAYMENT 행이 없으면 기록하지 않는다.
- **`amount`는 −부호**(원 결제 금액의 음수, 전액).
- 멱등: `(transaction_key, 'CANCEL')` 유니크 — 이미 있으면 200으로 종료.
- service-role 클라이언트로 기록하고, 스냅샷은 원 PAYMENT 행의
  `payment_snapshot_id`를 재사용한다.

## 결제 취소 (사용자 취소 · 포트원 연동)

구현 위치: `src/app/api/payments/[id]/cancel/route.ts`(+ 공용 경로
`src/app/api/payments/shared.ts`의 `cancelPortonePayment`·`verifyAndRecordCancel`),
마이페이지 결제·취소 내역 `GET /api/my/payments` + `src/app/my/my-view.tsx`.

- `POST /api/payments/[id]/cancel` — `[id]`는 원장 PAYMENT 행 id. RLS로 본인
  결제만 취소할 수 있다. 모임 시작 후에는 취소 불가. 이미 CANCEL 행이 있으면
  포트원 호출 없이 409로 끝낸다.
- 원장 기록 **전에** `POST https://api.portone.io/payments/{paymentId}/cancel`
  (PortOne 인증 스킴, body `{ reason, requester: 'Customer' }` — `amount` 생략
  = 전액 취소)이 성공해야 한다. `paymentId` = `transaction_key`. 실패하면
  기록하지 않는다.
- 이미 취소된 결제(409 `PAYMENT_ALREADY_CANCELLED`)는 성공으로 취급하고 기록
  경로로 진행한다 — 콘솔 수동 취소 등으로 원장이 비어 있으면 여기서 메워진다.
- 기록은 취소 웹훅과 공용 경로 `verifyAndRecordCancel` — 포트원 단건 조회로
  `CANCELLED`를 재검증한 뒤 CANCEL 행(`amount` −, 원 PAYMENT 행의 스냅샷
  재사용)을 insert-only로 남긴다. 멱등이라 취소 웹훅과 경합해도 안전하다.
  취소 성공 후 기록이 일시 오류로 실패해도 취소 웹훅이 원장을 채운다.
- 정책: 전액 환불만 지원(부분 취소 금지).

## 금지 사항

- 결제 금액·상품명·상품가격을 클라이언트 입력으로 받는 API 금지.
- 포트원 단건 조회로 `PAID`(취소는 `CANCELLED`)를 확인하지 않은 원장 기록 금지.
- 시크릿의 `NEXT_PUBLIC_` 노출·클라이언트 사용 금지.
- V1 API·SDK 혼용 금지, `Bearer` 스킴 금지(`PortOne` 스킴 사용).
- 원장 행 UPDATE·DELETE 금지. 부호 규칙(PAYMENT +, CANCEL −) 위반 금지.
- 시그니처 검증 없는 웹훅 처리 금지. service-role 클라이언트를 웹훅 외 사용자
  요청 BFF에서 사용 금지.

## 알려진 한계 (TODO)

- **동시성(TOCTOU)** — 서로 다른 paymentId 두 건이 동시에 검증되면 본인 1자리·
  정원 검사를 둘 다 통과할 수 있다. `(transaction_key, type)` 유니크는 같은
  paymentId 중복만 막는다. 발생 시 수동 환불, 근본 해결은 직렬화된 RPC 또는
  활성 참여 1건 강제 제약.
- **심층 방어** — 원장 INSERT가 authenticated RLS로도 열려 있어 검증 로직이
  BFF 계층에만 있다. 쓰기를 service-role로 통일하고 authenticated INSERT
  정책 제거를 검토한다.
- **자동 환불** — 승인 후 검증 거절 케이스에서 `cancelPortonePayment` 자동
  호출은 미연동 — 콘솔에서 수동 취소한다.

## 테스트

- 테스트 채널 결제는 실제 과금되지 않거나 PG가 당일 자동 취소한다. 그래도
  소액·테스트 카드로만 시험한다.
- 검증 실패 케이스(금액 위·변조, 남의 paymentId, 중복 호출)는
  `/api/payments/complete`에 직접 요청해 확인한다.
- 웹훅은 콘솔의 [호출 테스트]로 URL·시그니처 검증을 확인하고, 로컬은 터널링
  (HTTPS)으로 수신한다.
