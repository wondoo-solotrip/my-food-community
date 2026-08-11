'use client';

/**
 * 맛집 등록·수정 공용 폼 — design.pen `03 Register Page`의 폼 영역을 실제
 * BFF(`/api/places*`)에 연결한 것. `place`가 없으면 등록(POST), 있으면
 * 수정(PUT)으로 동작한다.
 *
 * 검증 규칙은 BFF와 동일하다: 이름 필수, 내용 10자 이상, 사진 1장 이상
 * (수정에서는 0장이면 기존 사진 유지, 새로 선택하면 전체 교체), 그리고
 * 지도 정보(장소명·지번 주소·좌표) 필수 — 지도에서 확정하지 않으면 등록·수정을
 * 막는다.
 */
import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';

import {
  AddressRow,
  Button,
  FileItem,
  FileUploader,
  TextField,
  Textarea,
  Toast,
} from '@/components';
import { ADDRESS_PENDING, type PlaceSearchResult, type PlaceSelection } from '@/lib/places';

import { PlaceConfirmView } from './place-confirm-view';
import { PlaceSearchView } from './place-search-view';

const TITLE_MAX = 100;
const CONTENT_MIN = 10;
const CONTENT_MAX = 500;
const IMAGE_MAX_COUNT = 5;
const IMAGE_MAX_BYTES = 5 * 1024 * 1024;

export interface PlaceFormPlace {
  id: string;
  title: string;
  content: string;
  imageUrls: string[];
  /** 저장된 장소명. 지도 연동 전 글에만 null이 남아 있다. */
  placeName: string | null;
  /** 저장된 지번 주소. 지도 연동 전 글에는 `ADDRESS_PENDING`. */
  address: string;
  /** 저장된 지도 좌표. 지도 연동 전 글에만 null이 남아 있다. */
  lat: number | null;
  lng: number | null;
}

export interface PlaceFormProps {
  /** 수정할 맛집. 없으면 신규 등록 폼으로 동작한다. */
  place?: PlaceFormPlace;
}

interface FieldErrors {
  title?: string;
  content?: string;
  images?: string;
  place?: string;
}

export function PlaceForm({ place }: PlaceFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isEdit = place !== undefined;
  const [title, setTitle] = useState(place?.title ?? '');
  const [content, setContent] = useState(place?.content ?? '');
  const [files, setFiles] = useState<File[]>([]);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [toast, setToast] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // 장소 입력 흐름 — 폼 위에 전체 화면으로 얹히는 단계. 지도(07)가 먼저 열리고,
  // 지도 위 검색 필드를 누르면 검색(08)으로 전환됐다가 지도로 돌아온다.
  // 지도 정보는 필수라 장소명·지번 주소·좌표가 모두 있어야 확정된 선택으로
  // 인정한다 — 지도 연동 전 글(주소·좌표 없음)은 수정 시 다시 확정해야 한다.
  const [selection, setSelection] = useState<PlaceSelection | null>(() =>
    place?.placeName &&
    place.address &&
    place.address !== ADDRESS_PENDING &&
    place.lat !== null &&
    place.lng !== null
      ? {
          name: place.placeName,
          address: place.address,
          lat: place.lat,
          lng: place.lng,
        }
      : null,
  );
  const [step, setStep] = useState<'form' | 'map' | 'search'>('form');
  // 지도에 표시 중인(아직 확정 전) 장소.
  const [pendingPlace, setPendingPlace] = useState<PlaceSearchResult | null>(null);

  const validate = (): FieldErrors => {
    const next: FieldErrors = {};
    if (!title.trim()) next.title = '맛집 이름을 입력해주세요.';
    if (content.trim().length < CONTENT_MIN) {
      next.content = `맛집 내용을 ${CONTENT_MIN}자 이상 입력해주세요.`;
    }
    if (!isEdit && files.length === 0) next.images = '사진을 1장 이상 올려주세요.';
    if (files.length > IMAGE_MAX_COUNT) {
      next.images = `사진은 최대 ${IMAGE_MAX_COUNT}장까지 올릴 수 있어요.`;
    }
    if (files.some((file) => !file.type.startsWith('image/'))) {
      next.images = '이미지 파일만 업로드할 수 있습니다.';
    }
    if (files.some((file) => file.size > IMAGE_MAX_BYTES)) {
      next.images = '이미지는 5MB 이하만 업로드할 수 있습니다.';
    }
    // 지도 정보는 필수 — 지도에서 확정한 장소가 없으면 등록·수정을 막는다.
    if (!selection) next.place = '지도에서 장소를 입력해주세요.';
    return next;
  };

  const handleSubmit = async () => {
    const next = validate();
    setErrors(next);
    if (Object.keys(next).length > 0 || !selection) {
      setToast(`${isEdit ? '수정' : '등록'}하지 못했어요 · 입력 내용을 확인해 주세요.`);
      return;
    }

    setIsSaving(true);
    setToast(null);
    try {
      const formData = new FormData();
      formData.set('title', title.trim());
      formData.set('content', content.trim());
      formData.set('placeName', selection.name);
      formData.set('address', selection.address);
      formData.set('lat', String(selection.lat));
      formData.set('lng', String(selection.lng));
      files.forEach((file) => formData.append('images', file));

      const res = await fetch(isEdit ? `/api/places/${place.id}` : '/api/places', {
        method: isEdit ? 'PUT' : 'POST',
        body: formData,
      });
      if (res.status === 401) {
        router.push('/login');
        return;
      }
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.place) {
        setToast(data?.error ?? `맛집 ${isEdit ? '수정' : '등록'}에 실패했습니다.`);
        return;
      }
      router.push(`/restaurants/${data.place.id}`);
    } catch {
      setToast(`맛집 ${isEdit ? '수정' : '등록'}에 실패했습니다.`);
    } finally {
      setIsSaving(false);
    }
  };

  const uploaderHelper = errors.images
    ? '음식이나 매장 사진이 있어야 다른 사람이 확인할 수 있어요.'
    : isEdit && files.length === 0
      ? `기존 사진 ${place.imageUrls.length}장 유지 · 새로 선택하면 전체 교체돼요`
      : `JPG · PNG · 장당 5MB · 최대 ${IMAGE_MAX_COUNT}장`;

  return (
    <div className="flex flex-col gap-5">
      {toast && <Toast type="error" message={toast} onClose={() => setToast(null)} />}

      <section className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h2 className="type-heading-sm text-text-default">사진</h2>
          <span className={`type-label-md ${errors.images ? 'text-text-error' : 'text-text-secondary'}`}>
            {isEdit ? '선택' : '필수'}
          </span>
        </div>
        <FileUploader
          state={isSaving ? 'disabled' : errors.images ? 'error' : 'default'}
          helper={uploaderHelper}
          promptText={errors.images ?? '사진을 1장 이상 올려주세요'}
          onSelect={() => fileInputRef.current?.click()}
        >
          {files.map((file, index) => (
            <FileItem
              key={`${file.name}-${index}`}
              name={file.name}
              statusText="첨부됨"
              onRemove={
                isSaving
                  ? undefined
                  : () => setFiles((prev) => prev.filter((_, i) => i !== index))
              }
            />
          ))}
        </FileUploader>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(event) => {
            const picked = Array.from(event.target.files ?? []);
            if (picked.length > 0) {
              setFiles((prev) => [...prev, ...picked]);
              // 사진을 고르면 사진 누락 에러 표시를 바로 푼다.
              setErrors((prev) => (prev.images ? { ...prev, images: undefined } : prev));
            }
            // 같은 파일을 다시 골라도 change가 오도록 값을 비운다.
            event.target.value = '';
          }}
        />
      </section>

      <div className="flex flex-col gap-4">
        <TextField
          label="맛집 이름"
          value={title}
          maxLength={TITLE_MAX}
          state={errors.title ? 'error' : isSaving ? 'disabled' : 'default'}
          errorMessage={errors.title}
          disabled={isSaving}
          onChange={(event) => {
            setTitle(event.target.value);
            // 다시 입력하기 시작하면 에러 표시(주황 텍스트 포함)를 바로 푼다.
            setErrors((prev) => (prev.title ? { ...prev, title: undefined } : prev));
          }}
        />
        <Textarea
          label="맛집 내용"
          value={content}
          state={errors.content ? 'error' : isSaving ? 'disabled' : 'default'}
          helper={`${CONTENT_MIN}자 이상 적어주세요`}
          errorMessage={errors.content}
          showCounter
          maxLength={CONTENT_MAX}
          disabled={isSaving}
          onChange={(event) => {
            setContent(event.target.value);
            setErrors((prev) => (prev.content ? { ...prev, content: undefined } : prev));
          }}
        />
      </div>

      {/* `.pen` 06 맛집 등록 / 장소 입력 추가 — 내용과 제출 사이의 장소 진입점.
          지도 정보가 필수라 사진 섹션과 같은 필수 표기·오류 안내를 붙인다. */}
      <section className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h2 className="type-heading-sm text-text-default">장소</h2>
          <span
            className={`type-label-md ${errors.place ? 'text-text-error' : 'text-text-secondary'}`}
          >
            필수
          </span>
        </div>
        {selection && <AddressRow text={selection.address} tone="secondary" />}
        <Button
          variant="secondary"
          size="lg"
          leadingIcon="plus"
          trailingIcon="arrow-right"
          disabled={isSaving}
          className="w-full"
          onClick={() => {
            // 이미 확정한 장소가 있으면 지도에 그대로 보여준다.
            setPendingPlace(
              selection
                ? {
                    name: selection.name,
                    roadAddress: '',
                    jibunAddress: selection.address,
                    lat: selection.lat,
                    lng: selection.lng,
                  }
                : null,
            );
            setStep('map');
          }}
        >
          장소 입력하기
        </Button>
        {errors.place && (
          <p className="type-label-md text-text-error">{errors.place}</p>
        )}
      </section>

      <Button size="lg" disabled={isSaving} className="w-full" onClick={handleSubmit}>
        {isSaving ? (isEdit ? '수정 중…' : '등록 중…') : isEdit ? '수정하기' : '등록하기'}
      </Button>

      {step === 'map' && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="장소 등록"
          className="fixed inset-0 z-50 overflow-y-auto bg-background-default"
        >
          <PlaceConfirmView
            place={pendingPlace ?? undefined}
            onSearch={() => setStep('search')}
            onBack={() => setStep('form')}
            onConfirm={(confirmed) => {
              // 지도에서 확정한 대로 받는다 — 주소·좌표는 리버스 지오코딩이
              // 반영된 현재 지도 중심 기준이고, 확정 버튼은 장소명·지번 주소·
              // 좌표가 모두 채워져야 활성화되므로 여기서는 항상 완전하다.
              if (
                !confirmed.jibunAddress ||
                confirmed.lat === undefined ||
                confirmed.lng === undefined
              ) {
                return;
              }
              setSelection({
                name: confirmed.name,
                address: confirmed.jibunAddress,
                lat: confirmed.lat,
                lng: confirmed.lng,
              });
              // 장소가 확정됐으니 지도 정보 누락 오류를 지운다.
              setErrors((prev) => ({ ...prev, place: undefined }));
              setStep('form');
            }}
          />
        </div>
      )}

      {step === 'search' && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="장소 검색"
          className="fixed inset-0 z-50 overflow-y-auto bg-background-default"
        >
          <PlaceSearchView
            initialQuery={pendingPlace?.name ?? selection?.name}
            onBack={() => setStep('map')}
            onSelect={(result) => {
              setPendingPlace(result);
              setStep('map');
            }}
            onRegisterName={(name) => {
              // 직접 입력은 장소명만 들고 지도(07)로 돌아간다 — 검색 필드에
              // 이름이 들어가고 주소·지도 중심(서울시청)은 기본값을 유지한다.
              setPendingPlace({ name, roadAddress: '', jibunAddress: '' });
              setStep('map');
            }}
          />
        </div>
      )}
    </div>
  );
}
