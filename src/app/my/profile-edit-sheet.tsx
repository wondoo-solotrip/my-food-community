'use client';

/**
 * 프로필 수정 바텀시트 — 마이페이지의 "프로필 수정" 버튼으로 연다.
 *
 * 닉네임과 프로필 사진을 고쳐 `PUT /api/profile`(BFF)로 저장한다. 사진은
 * 선택 즉시 미리보기만 하고, 실제 업로드는 저장 시 서버에서 처리한다.
 */
import { useEffect, useRef, useState } from 'react';

import { BottomSheet, Button, TextField } from '@/components';

const NICKNAME_MAX = 20;

interface ProfileSummary {
  nickname: string;
  imageUrl: string | null;
}

export interface ProfileEditSheetProps {
  initialNickname: string;
  initialImageUrl: string | null;
  onClose: () => void;
  onSaved: (profile: ProfileSummary) => void;
}

export function ProfileEditSheet({
  initialNickname,
  initialImageUrl,
  onClose,
  onSaved,
}: ProfileEditSheetProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [nickname, setNickname] = useState(initialNickname);
  // 파일과 미리보기 URL을 한 쌍으로 들고, 교체·언마운트 시 이전 URL을 해제한다.
  const [picked, setPicked] = useState<{ file: File; url: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!picked) return;
    return () => URL.revokeObjectURL(picked.url);
  }, [picked]);

  const handleSave = async () => {
    const trimmed = nickname.trim();
    if (!trimmed) {
      setError('닉네임을 입력해주세요.');
      return;
    }

    setIsSaving(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('nickname', trimmed);
      if (picked) formData.append('image', picked.file);

      const res = await fetch('/api/profile', { method: 'PUT', body: formData });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.profile) {
        setError(data?.error ?? '프로필 저장에 실패했습니다.');
        return;
      }
      onSaved(data.profile);
    } catch {
      setError('프로필 저장에 실패했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <BottomSheet title="프로필 수정" onClose={isSaving ? undefined : onClose}>
      <div className="mx-auto flex w-full max-w-[420px] flex-col items-center gap-5">
        <div className="flex flex-col items-center gap-3">
          {/* 파일 선택 직후엔 blob: URL이라 next/image 최적화를 태울 수 없다. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={picked?.url ?? initialImageUrl ?? '/images/profile.png'}
            alt="프로필 사진 미리보기"
            className="size-20 rounded-full border border-border-default object-cover"
          />
          <Button
            variant="secondary"
            size="sm"
            leadingIcon="image"
            disabled={isSaving}
            onClick={() => fileInputRef.current?.click()}
          >
            사진 변경
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              setPicked(file ? { file, url: URL.createObjectURL(file) } : null);
            }}
          />
        </div>

        <TextField
          label="닉네임"
          value={nickname}
          maxLength={NICKNAME_MAX}
          state={error ? 'error' : isSaving ? 'disabled' : 'default'}
          helper={`최대 ${NICKNAME_MAX}자`}
          errorMessage={error ?? undefined}
          disabled={isSaving}
          onChange={(event) => setNickname(event.target.value)}
        />

        <div className="flex w-full gap-2.5">
          <Button
            variant="secondary"
            size="lg"
            className="flex-1"
            disabled={isSaving}
            onClick={onClose}
          >
            취소
          </Button>
          <Button size="lg" className="flex-1" disabled={isSaving} onClick={handleSave}>
            {isSaving ? '저장 중…' : '저장'}
          </Button>
        </div>
      </div>
    </BottomSheet>
  );
}
