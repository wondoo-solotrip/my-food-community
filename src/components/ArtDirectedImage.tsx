/**
 * ArtDirectedImage — 뷰포트에 따라 다른 원본을 거는 아트 디렉션 이미지.
 *
 * 상품 이미지는 데스크톱용(`lg`)과 모바일·태블릿용(`md`) 두 벌로 관리한다.
 * CSS로 숨기는 방식은 두 원본을 모두 내려받으므로, Next.js 공식 아트 디렉션
 * 패턴대로 `getImageProps`의 srcSet을 `<picture>`에 나눠 담아 브라우저가
 * 매칭된 소스 하나만 받게 한다. 컨테이너를 채우는 fill 이미지 전용이라
 * 부모에 `relative`와 비율(aspect)이 있어야 한다.
 */
import { getImageProps } from 'next/image';

/** 데스크톱 전환점 — Tailwind `lg`(1024px). 미만은 모바일·태블릿으로 본다. */
const DESKTOP_MEDIA = '(min-width: 1024px)';

export interface ArtDirectedImageProps {
  /** 데스크톱(≥1024px)용 원본. */
  srcLg: string;
  /** 모바일·태블릿(<1024px)용 원본. */
  srcMd: string;
  alt: string;
  /** 두 소스가 공유하는 `sizes` 힌트 — srcset 해상도 선택에 쓰인다. */
  sizes: string;
  /** `<img>`에 얹을 클래스 — 보통 `object-cover`. */
  className?: string;
  /** 첫 화면(LCP) 이미지면 즉시 로드한다. */
  eager?: boolean;
}

export function ArtDirectedImage({
  srcLg,
  srcMd,
  alt,
  sizes,
  className,
  eager = false,
}: ArtDirectedImageProps) {
  const common = {
    alt,
    fill: true as const,
    sizes,
    className,
    ...(eager ? { loading: 'eager' as const, fetchPriority: 'high' as const } : {}),
  };
  const {
    props: { srcSet: desktopSrcSet },
  } = getImageProps({ ...common, src: srcLg });
  const { props: imgProps } = getImageProps({ ...common, src: srcMd });

  return (
    <picture>
      <source media={DESKTOP_MEDIA} srcSet={desktopSrcSet} />
      <img {...imgProps} alt={imgProps.alt} />
    </picture>
  );
}
