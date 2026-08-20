'use client';

/**
 * 05 My Page — design.pen `05 My Page` + `12–14 My Page` 탭 3종.
 *
 * Profile summary card, 내가 쓴 글·결제 내역·취소 내역 탭(12–14), and the
 * logout action above the bottom navigation. 결제 내역 카드의 결제 취소는
 * `POST /api/payments/[id]/cancel`로 취소 원장을 남기고 목록을 다시 읽는다.
 */
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Fragment, useEffect, useState } from 'react';

import {
  BottomSheet,
  Button,
  Card,
  EmptyState,
  Icon,
  IconButton,
  Skeleton,
  TabNavigation,
} from '@/components';
import type { CanceledHistoryItem, PaymentHistoryItem } from '@/lib/events';
import type { PlaceSummary } from '@/lib/places';

import { AppBottomNav } from '../_components/app-bottom-nav';
import { AppTopNav } from '../_components/app-top-nav';
import { CanceledHistoryCard, PaymentHistoryCard } from './payment-history';
import { ProfileEditSheet } from './profile-edit-sheet';

const CARD_LINK =
  'rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus';

interface AuthUser {
  id: string;
  email: string | null;
  name: string;
  avatarUrl: string | null;
}

interface ProfileSummary {
  nickname: string;
  imageUrl: string | null;
}

/** 디자인 표기(예: 2026. 07. 28)로 작성일을 맞춘다. */
function formatDate(iso: string): string {
  const date = new Date(iso);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}. ${month}. ${day}`;
}

/** design.pen 12–14 — 마이페이지 탭 순서. `/my?tab=` 딥링크와 인덱스를 공유한다. */
const TABS = ['내가 쓴 글', '결제 내역', '취소 내역'];

/** 수업용 하드코딩 목업 — DB 없이 결제·취소 내역을 보여준다. */
const MOCK_PAYMENTS: PaymentHistoryItem[] = [
  {
    id: '2f6f9b70-93a1-4a54-9b9e-1f30a4d20001',
    amount: 30000,
    paidAt: '2026-08-13T21:04:00+09:00',
    eventName: '8월 구로 미식 모임',
    eventAt: '2026-08-29T19:30:00+09:00',
    eventAddress: '구로시장 키친',
    imageUrl: '/images/guro-table-dinner.png',
  },
  {
    id: '2f6f9b70-93a1-4a54-9b9e-1f30a4d20003',
    amount: 25000,
    paidAt: '2026-08-10T18:12:00+09:00',
    eventName: '9월 문래 골목 미식회',
    eventAt: '2026-09-12T19:00:00+09:00',
    eventAddress: '문래동 철공소 키친',
    imageUrl: '/images/kalguksu.png',
  },
  {
    id: '2f6f9b70-93a1-4a54-9b9e-1f30a4d20004',
    amount: 40000,
    paidAt: '2026-08-05T09:40:00+09:00',
    eventName: '10월 오류동 김장 클래스',
    eventAt: '2026-10-17T11:00:00+09:00',
    eventAddress: '오류동 공유 부엌',
    imageUrl: '/images/bamil-cafe.png',
  },
];

const MOCK_CANCELED: CanceledHistoryItem[] = [
  {
    id: '2f6f9b70-93a1-4a54-9b9e-1f30a4d20002',
    amount: 25000,
    canceledAt: '2026-07-18T10:32:00+09:00',
    eventName: '7월 동네 식탁 이야기',
  },
];

export interface MyViewProps {
  /** `/my?tab=payments` 같은 딥링크가 정하는 시작 탭. 기본은 내가 쓴 글. */
  initialTab?: number;
  /** Storybook 등 API가 없는 환경에서 프로필을 주입한다. 앱에서는 생략. */
  initialProfile?: ProfileSummary;
  /** Storybook 등 API가 없는 환경에서 내가 쓴 글을 주입한다. 앱에서는 생략. */
  initialPlaces?: PlaceSummary[];
  /** Storybook 등 API가 없는 환경에서 결제 내역을 주입한다. 앱에서는 생략. */
  initialPayments?: PaymentHistoryItem[];
  /** Storybook 등 API가 없는 환경에서 취소 내역을 주입한다. 앱에서는 생략. */
  initialCanceled?: CanceledHistoryItem[];
}

export function MyView({
  initialTab = 0,
  initialProfile,
  initialPlaces,
  initialPayments,
  initialCanceled,
}: MyViewProps) {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<ProfileSummary | null>(initialProfile ?? null);
  // 계정·프로필 응답이 오기 전에는 스켈레톤을 유지한다 — 디폴트 아바타·이름이
  // 잠깐 보였다가 실제 값으로 바뀌는 깜빡임을 막는다.
  const [isIdentityLoading, setIsIdentityLoading] = useState(!initialProfile);
  const [tab, setTab] = useState(initialTab);
  // null이면 아직 불러오는 중이다.
  const [places, setPlaces] = useState<PlaceSummary[] | null>(initialPlaces ?? null);
  // 결제·취소 내역은 수업용 하드코딩 목업이다(서버 페칭 없음). null이면 로딩 중 —
  // 목업이어도 각 탭을 "처음 여는 시점"에 로딩을 잠깐 흉내 내 스켈레톤을 보여준다.
  // 두 내역은 서로 다른 데이터라 로딩 상태도 탭별로 독립이다.
  const [payments, setPayments] = useState<PaymentHistoryItem[] | null>(initialPayments ?? null);
  const [canceled, setCanceled] = useState<CanceledHistoryItem[] | null>(initialCanceled ?? null);

  useEffect(() => {
    if (tab !== 1 || payments !== null) return;
    const timer = setTimeout(() => setPayments(MOCK_PAYMENTS), 600);
    return () => clearTimeout(timer);
  }, [tab, payments]);

  useEffect(() => {
    if (tab !== 2 || canceled !== null) return;
    const timer = setTimeout(() => setCanceled(MOCK_CANCELED), 600);
    return () => clearTimeout(timer);
  }, [tab, canceled]);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  // ⋮ 더보기로 연 글 관리 바텀시트의 대상 글. null이면 닫힘.
  const [actionPlace, setActionPlace] = useState<PlaceSummary | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/my/places')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled && data?.places) setPlaces(data.places);
      })
      .catch(() => {
        // API가 없는 환경(Storybook)에서는 주입된 목록을 유지한다.
      })
      .finally(() => {
        if (!cancelled) setPlaces((prev) => prev ?? []);
      });
    const userRequest = fetch('/api/auth/me')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled && data?.user) setUser(data.user);
      })
      .catch(() => {
        // 미로그인이거나 API를 쓸 수 없는 환경(Storybook)에서는 목업을 유지한다.
      });
    const profileRequest = fetch('/api/profile')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled && data?.profile) setProfile(data.profile);
      })
      .catch(() => {
        // 프로필을 아직 만들지 않았거나 Storybook이면 구글 계정 정보로 대신한다.
      });
    // 두 응답이 모두 끝난 뒤에야 프로필 스켈레톤을 걷는다 — 그때도 데이터가
    // 없으면 그제서야 디폴트 아바타·이름이 보인다.
    Promise.allSettled([userRequest, profileRequest]).then(() => {
      if (!cancelled) setIsIdentityLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // 직접 수정한 프로필이 구글 계정 정보보다 우선한다.
  const displayName = profile?.nickname ?? user?.name ?? '맛집사냥꾼';
  const avatarUrl = profile?.imageUrl ?? user?.avatarUrl ?? '/images/profile.png';

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } finally {
      router.replace('/login');
    }
  };

  // 소프트삭제 — 성공한 글만 목록에서 걷어낸다.
  const handleDelete = async (place: PlaceSummary) => {
    setDeletingId(place.id);
    try {
      const res = await fetch(`/api/places/${place.id}`, { method: 'DELETE' });
      if (res.ok) {
        setPlaces((prev) => prev?.filter((item) => item.id !== place.id) ?? prev);
      }
    } finally {
      setDeletingId(null);
    }
  };

  // 결제 취소 — 수업용 목업: 서버 없이 로컬 상태에서 결제를 취소 내역으로 옮긴다.
  // 취소 내역이 아직 안 열려 봤다면(null) 기본 목업 위에 얹어 로드된 것으로 친다.
  const handleCancelPayment = (payment: PaymentHistoryItem) => {
    setPayments((prev) => prev?.filter((item) => item.id !== payment.id) ?? prev);
    setCanceled((prev) => [
      {
        id: payment.id,
        amount: payment.amount,
        canceledAt: new Date().toISOString(),
        eventName: payment.eventName,
      },
      ...(prev ?? MOCK_CANCELED),
    ]);
  };

  return (
    // 앱 셸: 문서 스크롤 없이 본문(main)만 스크롤한다. 상단 내비게이션과
    // 바텀 내비게이션은 셸에 고정되어 오버스크롤 바운스에도 움직이지 않는다.
    <div className="mx-auto flex h-dvh w-full max-w-[1280px] flex-col overflow-hidden">
      <AppTopNav
        title="마이페이지"
        // 웹(md+)에서는 바텀 내비 대신 탑내비 우측의 홈 항목(같은 20px 아이콘 +
        // 12px 라벨)으로 홈에 돌아간다. 모바일에서는 기존처럼 40px 스페이서만
        // 남겨 제목 중앙 정렬을 유지한다.
        trailingContent={
          <span className="flex size-10 shrink-0 items-center justify-center md:size-auto">
            <button
              type="button"
              onClick={() => router.push('/')}
              className="hidden flex-col items-center justify-center gap-0.5 text-text-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus md:flex"
            >
              <Icon name="home" size={20} />
              <span className="type-label-md">홈</span>
            </button>
          </span>
        }
      />

      <main className="scrollbar-hidden flex w-full flex-1 flex-col gap-6 overflow-y-auto overscroll-contain px-4 pt-5 pb-6 md:px-8">
        {/* 프로필 요약 — 테두리·배경 없이 플랫하게, 좌우 패딩만 유지한다.
            연필(프로필 수정) 버튼은 이름 바로 오른쪽에 붙인다.
            계정·프로필 로딩이 끝나기 전에는 스켈레톤으로 채운다. */}
        {isIdentityLoading ? (
          <section className="flex items-center gap-4 px-5" aria-hidden>
            <Skeleton variant="circle" size={72} />
            <div className="flex flex-col gap-2">
              <Skeleton variant="rectangle" width={120} height={24} className="rounded-sm" />
              <Skeleton variant="rectangle" width={160} height={14} className="rounded-sm" />
            </div>
          </section>
        ) : (
        <section className="flex items-center gap-4 px-5">
          <Image
            src={avatarUrl}
            alt={`${displayName} 프로필 사진`}
            width={928}
            height={1136}
            className="size-[72px] shrink-0 rounded-full border-[3px] border-background-surface object-cover"
          />
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <div className="flex min-w-0 items-center gap-1">
              <h2 className="type-heading-lg truncate text-text-strong">{displayName}</h2>
              {/* -my-2: 40px 터치 영역이 행 높이를 키우지 않게 텍스트 높이에 맞춘다. */}
              <IconButton
                icon="edit"
                label="프로필 수정"
                size={40}
                iconSize={20}
                className="-my-2 shrink-0"
                onClick={() => setIsEditOpen(true)}
              />
            </div>
            {/* 로그아웃은 이메일 라인 오른쪽의 최소 아이콘(16)으로 둔다. */}
            <div className="flex min-w-0 items-center justify-between gap-2">
              <p className="type-label-md truncate text-text-secondary">
                {user?.email ?? 'Google 계정 연결됨'}
              </p>
              {/* -my-2: 32px 터치 영역이 행 높이를 키우지 않게 텍스트 높이에 맞춘다. */}
              <IconButton
                icon="logout"
                label="로그아웃"
                size={32}
                iconSize={16}
                className="-my-2 shrink-0 text-text-secondary"
                disabled={isLoggingOut}
                onClick={handleLogout}
              />
            </div>
          </div>
        </section>
        )}

        <TabNavigation tabs={TABS} activeIndex={tab} onSelect={setTab} />

        {tab === 0 && (
        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            {/* 세 탭의 섹션 헤더는 같은 레벨 — heading-sm(16px·Semibold)로 통일. */}
            <h2 className="type-heading-sm text-text-default">
              내가 쓴 글{places !== null && ` ${places.length}`}
            </h2>
            <span className="type-label-md text-text-subtle">최신순</span>
          </div>

          {places === null ? (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              {/* 플랫 가로 카드와 같은 구도: 96px 라운드 사진 + 날짜·제목·주소 순 세 줄. */}
              {Array.from({ length: 3 }, (_, i) => (
                <div key={i} className="flex gap-3">
                  <Skeleton variant="rectangle" width={96} height={96} className="rounded-2xl" />
                  {/* 높이는 각 줄의 글자 크기를 따른다 — 날짜 12·제목 16·주소 14. */}
                  <div className="flex flex-1 flex-col gap-2">
                    <Skeleton variant="rectangle" width="30%" height={12} className="rounded-sm" />
                    <Skeleton variant="rectangle" width="62%" height={16} className="rounded-sm" />
                    <Skeleton variant="rectangle" width="82%" height={14} className="rounded-sm" />
                  </div>
                </div>
              ))}
            </div>
          ) : places.length === 0 ? (
            <EmptyState
              visual="image"
              title="아직 작성한 글이 없어요"
              description="동네에서 발견한 숨은 맛집을 소개해보세요."
              primaryAction={{ label: '맛집 등록', onClick: () => router.push('/register') }}
              className="py-10"
            />
          ) : (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              {places.map((place, index) => (
                <div key={place.id}>
                  <Link href={`/restaurants/${place.id}`} className={`${CARD_LINK} block`}>
                    <Card
                      orientation="horizontal"
                      // 흰 배경 위 플랫 카드 — 테두리 없이 사진·텍스트만 남긴다.
                      // 사진↔텍스트 간격은 컨텐츠 패딩 대신 카드의 gap으로 준다.
                      className="gap-3"
                      bordered={false}
                      // 사진 우측 상·하단에도 카드와 같은 라운드를 준다.
                      imageClassName="size-24 overflow-hidden rounded-r-2xl"
                      // 패딩 없이 사진 상단 라인부터 날짜 → 제목·주소 순으로 쌓는다.
                      // 좌우 패딩이 없어 ⋮가 카드 오른쪽 끝에 딱 붙는다.
                      contentClassName="gap-1 p-0"
                      // 날짜 라인을 제목 위에 둔다.
                      metadataPosition="top"
                      image={
                        place.imageUrl ? (
                          <Image
                            src={place.imageUrl}
                            alt=""
                            width={384}
                            height={384}
                            loading={index === 0 ? 'eager' : undefined}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          true
                        )
                      }
                      title={place.title}
                      // 제목과 날짜 사이에 풀주소를 넣는다 — BFF 응답의 address.
                      description={place.address}
                      metadata={{ text: formatDate(place.createdAt) }}
                      // 날짜 라인 오른쪽 끝의 ⋮ 더보기 — 글 관리 바텀시트를 연다.
                      // 카드가 링크 안에 있으므로 클릭이 상세 이동으로 번지지 않게
                      // 막고, -my-2로 32px 히트 영역이 라인 높이를 키우지 않게 한다.
                      metadataTrailing={
                        <IconButton
                          icon="more-vertical"
                          label={`${place.title} 더보기`}
                          size={32}
                          iconSize={16}
                          // -mr-2: 32px 히트 영역의 안쪽 여백만큼 당겨 ⋮ 글리프를
                          // 카드 오른쪽 끝에 광학 정렬한다.
                          className="-my-2 -mr-2 text-text-subtle"
                          onClick={(event) => {
                            event.preventDefault();
                            event.stopPropagation();
                            setActionPlace(place);
                          }}
                        />
                      }
                    />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </section>
        )}

        {tab === 1 && (
          <section className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="type-heading-sm text-text-default">참여 예정 모임</h2>
              {payments !== null && (
                <span className="type-label-md font-semibold text-text-brand">
                  {payments.length}건
                </span>
              )}
            </div>

            {payments === null ? (
              /* 플랫 결제 카드와 같은 구도의 스켈레톤 — 요약·금액 행·취소 버튼.
                 내가 쓴 글과 같은 반응형 그리드(1→2→3열). */
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 3 }, (_, i) => (
                  <Fragment key={i}>
                    {/* 모바일(1열)에서만 결제건 사이 회색 구분 밴드를 유지한다. */}
                    {i > 0 && (
                      <div aria-hidden className="-mx-4 h-2.5 bg-background-subtle md:hidden" />
                    )}
                    <div className="flex flex-col gap-4">
                      <div className="flex gap-3">
                        <Skeleton variant="rectangle" width={72} height={72} className="rounded-xl" />
                        <div className="flex flex-1 flex-col gap-2">
                          <Skeleton variant="rectangle" width={56} height={20} className="rounded-full" />
                          <Skeleton variant="rectangle" width="55%" height={16} className="rounded-sm" />
                          <Skeleton variant="rectangle" width="70%" height={12} className="rounded-sm" />
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Skeleton variant="rectangle" width="100%" height={12} className="rounded-sm" />
                        <Skeleton variant="rectangle" width="100%" height={12} className="rounded-sm" />
                      </div>
                      <Skeleton variant="rectangle" width="100%" height={32} className="rounded-full" />
                    </div>
                  </Fragment>
                ))}
              </div>
            ) : payments.length === 0 ? (
              <EmptyState
                visual="image"
                title="아직 결제한 모임이 없어요"
                description="메인의 모임 배너에서 한 자리를 예약해보세요."
                primaryAction={{ label: '모임 보러 가기', onClick: () => router.push('/') }}
                className="py-10"
              />
            ) : (
              /* 내가 쓴 글과 같은 반응형 그리드(1→2→3열). 모바일(1열)에서는
                 기존처럼 결제건 사이에 회색 구분 밴드를 유지하고, md+ 그리드
                 에서는 간격이 구분을 대신한다. */
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                {payments.map((payment, index) => (
                  <Fragment key={payment.id}>
                    {/* 10px 두께의 연한 베이지(neutral-100) 밴드 — main의 좌우
                        패딩(px-4)을 뚫고 화면을 꽉 채운다. */}
                    {index > 0 && (
                      <div aria-hidden className="-mx-4 h-2.5 bg-background-subtle md:hidden" />
                    )}
                    <PaymentHistoryCard payment={payment} onCancel={handleCancelPayment} />
                  </Fragment>
                ))}
              </div>
            )}
          </section>
        )}

        {tab === 2 && (
          <section className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="type-heading-sm text-text-default">환불 완료 내역</h2>
              {canceled !== null && (
                <span className="type-label-md font-semibold text-text-subtle">
                  {canceled.length}건
                </span>
              )}
            </div>

            {canceled === null ? (
              /* subtle 배경 카드와 같은 크기의 스켈레톤 — 같은 반응형 그리드. */
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 3 }, (_, i) => (
                  <Skeleton key={i} variant="rectangle" width="100%" height={150} className="rounded-2xl" />
                ))}
              </div>
            ) : canceled.length === 0 ? (
              <EmptyState
                visual="image"
                title="취소한 내역이 없어요"
                description="결제를 취소하면 환불 내역이 여기에 남아요."
                className="py-10"
              />
            ) : (
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                {canceled.map((item) => (
                  <CanceledHistoryCard key={item.id} canceled={item} />
                ))}
              </div>
            )}
          </section>
        )}
      </main>

      {/* ⋮ 더보기로 여는 글 관리 바텀시트 — 수정·삭제를 버튼으로 제공한다. */}
      {actionPlace && (
        <BottomSheet
          title="글 관리"
          description={actionPlace.title}
          onClose={() => setActionPlace(null)}
        >
          <div className="flex flex-col gap-3 pt-1">
            <Button
              variant="secondary"
              size="lg"
              className="w-full"
              onClick={() => router.push(`/restaurants/${actionPlace.id}/edit`)}
            >
              수정
            </Button>
            <Button
              variant="destructive"
              size="lg"
              className="w-full"
              disabled={deletingId === actionPlace.id}
              onClick={async () => {
                await handleDelete(actionPlace);
                setActionPlace(null);
              }}
            >
              삭제
            </Button>
          </div>
        </BottomSheet>
      )}

      {isEditOpen && (
        <ProfileEditSheet
          initialNickname={profile?.nickname ?? user?.name ?? '맛집사냥꾼'}
          initialImageUrl={profile?.imageUrl ?? user?.avatarUrl ?? null}
          onClose={() => setIsEditOpen(false)}
          onSaved={(next) => {
            setProfile(next);
            setIsEditOpen(false);
          }}
        />
      )}

      <AppBottomNav />
    </div>
  );
}
