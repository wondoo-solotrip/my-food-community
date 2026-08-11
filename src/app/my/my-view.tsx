'use client';

/**
 * 05 My Page — design.pen `05 My Page`.
 *
 * Profile summary card, the written-posts list (horizontal cards that flow
 * into 2–3 columns on wider screens) and the logout action above the bottom
 * navigation.
 */
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { Button, Card, EmptyState, IconButton, Skeleton } from '@/components';
import type { PlaceSummary } from '@/lib/places';

import { AppBottomNav } from '../_components/app-bottom-nav';
import { AppTopNav } from '../_components/app-top-nav';
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

export interface MyViewProps {
  /** Storybook 등 API가 없는 환경에서 내가 쓴 글을 주입한다. 앱에서는 생략. */
  initialPlaces?: PlaceSummary[];
}

export function MyView({ initialPlaces }: MyViewProps) {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<ProfileSummary | null>(null);
  // null이면 아직 불러오는 중이다.
  const [places, setPlaces] = useState<PlaceSummary[] | null>(initialPlaces ?? null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
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
    fetch('/api/auth/me')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled && data?.user) setUser(data.user);
      })
      .catch(() => {
        // 미로그인이거나 API를 쓸 수 없는 환경(Storybook)에서는 목업을 유지한다.
      });
    fetch('/api/profile')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled && data?.profile) setProfile(data.profile);
      })
      .catch(() => {
        // 프로필을 아직 만들지 않았거나 Storybook이면 구글 계정 정보로 대신한다.
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

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[1280px] flex-col">
      <AppTopNav title="마이페이지" />

      <main className="flex w-full flex-1 flex-col gap-6 px-4 pt-5 pb-6 md:px-8">
        <section className="flex items-center gap-4 rounded-[20px] border border-border-brand bg-background-brand-subtle p-5">
          <Image
            src={avatarUrl}
            alt={`${displayName} 프로필 사진`}
            width={928}
            height={1136}
            className="size-[72px] shrink-0 rounded-full border-[3px] border-background-surface object-cover"
          />
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <h2 className="type-heading-lg text-text-strong">{displayName}</h2>
            <p className="type-label-md truncate text-text-secondary">
              {user?.email ?? 'Google 계정 연결됨'}
            </p>
          </div>
          <IconButton
            icon="edit"
            label="프로필 수정"
            size={40}
            iconSize={20}
            onClick={() => setIsEditOpen(true)}
          />
        </section>

        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="type-heading-md text-text-default">
              내가 쓴 글{places !== null && ` ${places.length}`}
            </h2>
            <span className="type-label-md text-text-subtle">최신순</span>
          </div>

          {places === null ? (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 3 }, (_, i) => (
                <Skeleton key={i} variant="rectangle" width="100%" height={96} />
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
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
              {places.map((place, index) => (
                <div key={place.id} className="relative">
                  <Link href={`/restaurants/${place.id}`} className={`${CARD_LINK} block`}>
                    <Card
                      orientation="horizontal"
                      // X 버튼 자리만큼 제목이 먼저 말줄임되도록 오른쪽을 비워 둔다.
                      className="pr-9"
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
                      metadata={{ icon: 'calendar', text: formatDate(place.createdAt) }}
                    />
                  </Link>
                  <IconButton
                    icon="close"
                    label={`${place.title} 삭제`}
                    size={32}
                    iconSize={16}
                    className="absolute top-1.5 right-1.5 text-text-subtle"
                    disabled={deletingId === place.id}
                    onClick={() => handleDelete(place)}
                  />
                </div>
              ))}
            </div>
          )}
        </section>

        <Button
          variant="secondary"
          size="lg"
          leadingIcon="logout"
          className="w-full md:mx-auto md:w-full md:max-w-[400px]"
          disabled={isLoggingOut}
          onClick={handleLogout}
        >
          로그아웃
        </Button>
      </main>

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
