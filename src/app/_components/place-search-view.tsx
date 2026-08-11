'use client';

/**
 * 08 장소 검색 — design.pen `08 장소 검색 / 네이버 API 결과`(Nrp83)와
 * `09 장소 검색 / 결과 없음 직접 입력`(wIk0q).
 *
 * 장소 등록 지도(07)의 검색 필드를 눌렀을 때 열리는 화면. `GET
 * /api/places/search`(BFF, 네이버 지역 검색 프록시)를 300ms 디바운스로
 * 호출한다. 결과가 있으면 목록에서 골라 "선택한 장소 사용하기"로 장소명·지번
 * 주소·좌표를 들고 지도(07)로 돌아가고, 없으면(또는 검색이 설정되지 않았으면)
 * 장소명 직접 입력으로 "장소명으로 등록하기"까지 이어진다 — 이때는 장소명만
 * 들고 지도(07)로 돌아가며, 지도 정보가 필수라 지도를 움직여 주소·좌표를
 * 확정해야 등록할 수 있다.
 *
 * 등록 폼 위에 전체 화면으로 얹히는 단계라 라우트가 아니라 콜백으로 흐름을
 * 잇는다. 폼 상태는 뒤에서 그대로 살아 있다.
 */
import { useEffect, useRef, useState } from 'react';

import { Button, EmptyState, Icon, TextField, TopNavigation, cn } from '@/components';
import type { PlaceSearchResult } from '@/lib/places';

const SEARCH_DEBOUNCE_MS = 300;

export interface PlaceSearchViewProps {
  /** 뒤로 가기 — 장소 등록 지도(07)로 돌아간다. */
  onBack: () => void;
  /** 검색 결과에서 고른 장소로 "선택한 장소 사용하기"를 눌렀을 때. */
  onSelect: (place: PlaceSearchResult) => void;
  /** 결과 없음에서 "장소명으로 등록하기"를 눌렀을 때. 이름만 넘기고 주소·좌표는 지도(07)에서 확정한다. */
  onRegisterName: (name: string) => void;
  initialQuery?: string;
  /** Storybook 등 API가 없는 환경에서 검색 상태를 주입한다. 앱에서는 생략. */
  initialResults?: PlaceSearchResult[];
}

export function PlaceSearchView({
  onBack,
  onSelect,
  onRegisterName,
  initialQuery = '',
  initialResults,
}: PlaceSearchViewProps) {
  const [query, setQuery] = useState(initialQuery);
  // null이면 아직 검색 전(대기 상태), 빈 배열이면 결과 없음.
  const [results, setResults] = useState<PlaceSearchResult[] | null>(initialResults ?? null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  // 디자인 09: 결과 없음으로 떨어지면 장소명 필드를 검색어로 미리 채운다.
  const [directName, setDirectName] = useState(
    initialResults !== undefined && initialResults.length === 0 ? initialQuery : '',
  );

  // 주입된 초기 상태(스토리)는 마운트 직후의 재검색으로 덮어쓰지 않는다.
  const injectedQuery = useRef(initialResults !== undefined ? initialQuery : null);
  const requestId = useRef(0);

  // 검색어를 지우면 대기 상태로 되돌리고 진행 중인 검색을 무효화한다.
  // (effect 안에서 동기로 setState하지 않도록 입력 핸들러에서 처리한다.)
  const updateQuery = (value: string) => {
    setQuery(value);
    if (!value.trim()) {
      requestId.current += 1;
      setResults(null);
    }
  };

  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed || trimmed === injectedQuery.current) return;

    const id = ++requestId.current;
    const timer = setTimeout(async () => {
      let next: PlaceSearchResult[] = [];
      try {
        const res = await fetch(`/api/places/search?query=${encodeURIComponent(trimmed)}`);
        const data = res.ok ? await res.json() : null;
        next = Array.isArray(data?.results) ? data.results : [];
      } catch {
        // 검색 실패는 결과 없음으로 떨어뜨려 직접 입력 흐름을 열어 둔다.
      }
      if (id !== requestId.current) return;
      setResults(next);
      setSelectedIndex(0);
      if (next.length === 0) setDirectName(trimmed);
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [query]);

  const isEmpty = results !== null && results.length === 0;
  const selected = results?.[selectedIndex];

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[1280px] flex-col">
      <TopNavigation
        title="장소 검색"
        leading={{ icon: 'arrow-left', label: '뒤로 가기', onClick: onBack }}
      />

      <main className="mx-auto flex w-full max-w-[640px] flex-1 flex-col gap-5 px-4 pt-2 pb-6">
        <TextField
          label="장소 검색"
          leadingIcon="search"
          value={query}
          helper={
            isEmpty ? '네이버에서 검색된 장소가 없습니다.' : '네이버에서 장소명과 주소를 검색합니다.'
          }
          trailingAction={
            query
              ? { icon: 'close', label: '검색어 지우기', onClick: () => updateQuery('') }
              : undefined
          }
          onChange={(event) => updateQuery(event.target.value)}
        />

        {results !== null && results.length > 0 && (
          <>
            <section className="flex flex-col gap-4" aria-label="네이버 검색 결과">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span aria-hidden className="type-heading-sm text-naver-green">
                    N
                  </span>
                  <h2 className="type-heading-sm text-text-default">네이버 검색 결과</h2>
                </div>
                <span className="type-label-md text-text-secondary">{results.length}개</span>
              </div>

              <ul>
                {results.map((result, index) => {
                  const isSelected = index === selectedIndex;
                  return (
                    <li
                      key={`${result.name}-${result.jibunAddress}`}
                      className="border-b border-border-default last:border-b-0"
                    >
                      <button
                        type="button"
                        aria-pressed={isSelected}
                        onClick={() => setSelectedIndex(index)}
                        className="flex w-full items-center gap-3 py-3 text-left"
                      >
                        <span className="flex size-7 shrink-0 items-center justify-center">
                          <Icon
                            name="home"
                            size={20}
                            className={isSelected ? 'text-naver-green' : 'text-text-secondary'}
                          />
                        </span>
                        <span className="flex min-w-0 flex-1 flex-col gap-[3px]">
                          <span
                            className={cn(
                              'type-heading-sm',
                              isSelected ? 'text-naver-green' : 'text-text-default',
                            )}
                          >
                            {result.name}
                          </span>
                          <span className="type-body-md truncate text-text-secondary">
                            {result.roadAddress || result.jibunAddress}
                          </span>
                        </span>
                        <Icon
                          name="chevron-right"
                          size={16}
                          className={isSelected ? 'text-naver-green' : 'text-text-secondary'}
                        />
                      </button>
                    </li>
                  );
                })}
              </ul>

              <div className="flex items-center gap-2 rounded-[10px] bg-background-subtle p-3">
                <Icon name="info" size={16} className="shrink-0 text-text-information" />
                <p className="type-label-md flex-1 text-text-secondary">
                  네이버 지역 검색 API에서 제공한 장소명과 주소입니다.
                </p>
              </div>
            </section>

            <Button
              size="lg"
              leadingIcon="check"
              className="w-full"
              disabled={!selected}
              onClick={() => selected && onSelect(selected)}
            >
              선택한 장소 사용하기
            </Button>
          </>
        )}

        {isEmpty && (
          <>
            <EmptyState
              visual="search"
              title="검색 결과가 없어요"
              description="네이버에서 찾지 못한 장소예요. 장소명만 직접 입력할 수 있어요."
              className="py-10"
            />

            <section className="flex flex-col gap-2" aria-label="장소명 직접 입력">
              <h2 className="type-heading-sm text-text-default">장소명 직접 입력</h2>
              <TextField
                label="장소명"
                leadingIcon="edit"
                value={directName}
                helper="장소명을 입력한 뒤 지도에서 위치를 지정해 주소를 채웁니다."
                onChange={(event) => setDirectName(event.target.value)}
              />
            </section>

            <div className="flex items-center gap-2 rounded-[10px] bg-background-warning p-3">
              <Icon name="info" size={16} className="shrink-0 text-text-warning" />
              <p className="type-label-md flex-1 text-text-warning">
                직접 입력한 장소는 지도에서 위치를 지정해 주소를 확인해야 등록할 수 있습니다.
              </p>
            </div>

            <Button
              size="lg"
              leadingIcon="check"
              className="w-full"
              disabled={!directName.trim()}
              onClick={() => onRegisterName(directName.trim())}
            >
              장소명으로 등록하기
            </Button>
          </>
        )}
      </main>
    </div>
  );
}
