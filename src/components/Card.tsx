/**
 * Card — `.pen`: `Card / Default`.
 *
 * Single variant, auto width and height. The image area is optional and its
 * frame is filled with `color-background-image-placeholder-warm`, the token the
 * colour foundation reserves for food photography — so an empty card still reads
 * as "photo goes here" rather than as a blank box.
 *
 * `image` takes a node rather than a `src` so the design system stays out of the
 * way of whichever image component the app uses.
 *
 * `orientation="horizontal"` mirrors the my-page `.pen` instances: the image
 * becomes a 96px square on the left and the content tightens to `p-3 gap-1`.
 */
import { Icon } from './Icon';
import { cn } from './cn';

export type CardOrientation = 'vertical' | 'horizontal';

export interface CardProps extends React.ComponentPropsWithoutRef<'article'> {
  title: string;
  description?: string;
  /** Small text line under the description; `icon` is optional. */
  metadata?: { icon?: string; text: string };
  /**
   * Node pinned to the right end of the metadata row (space-between) — e.g.
   * the my-page cards' edit/delete icon buttons sitting on the date line.
   */
  metadataTrailing?: React.ReactNode;
  /** 메타데이터 행 위치 — `top`이면 제목 위에 놓인다. Default `bottom`. */
  metadataPosition?: 'top' | 'bottom';
  /** Pass `true` for the bare warm placeholder, or a node to fill the area. */
  image?: React.ReactNode | true;
  orientation?: CardOrientation;
  /** `false` drops the outline — flat poster cards on a white page. Default true. */
  bordered?: boolean;
  /**
   * Replaces the image area's default sizing classes (`h-[150px] w-full`
   * vertical, `size-24` horizontal) — e.g. an aspect-ratio box for fluid grids.
   */
  imageClassName?: string;
  /**
   * Replaces the title's default type style (`type-heading-sm`, 16px) — e.g.
   * `type-label-lg` for the main-page poster grid's compact 14px titles.
   */
  titleClassName?: string;
  /**
   * Replaces the content area's default gap/padding classes (`gap-2 p-2`
   * vertical, `gap-1 p-3` horizontal) — e.g. `gap-2 px-0 py-2` when a
   * borderless card should align text flush with the photo edge.
   */
  contentClassName?: string;
}

export function Card({
  title,
  description,
  metadata,
  metadataTrailing,
  metadataPosition = 'bottom',
  image,
  orientation = 'vertical',
  bordered = true,
  imageClassName,
  titleClassName,
  contentClassName,
  className,
  ...rest
}: CardProps) {
  const horizontal = orientation === 'horizontal';
  const imageSizing = imageClassName ?? (horizontal ? 'size-24' : 'h-[150px] w-full');

  const metadataRow = metadata && (
    <div className="flex items-center gap-[5px]">
      {metadata.icon && (
        <span className="text-text-disabled">
          <Icon name={metadata.icon} size={16} />
        </span>
      )}
      <span className="type-label-md text-text-secondary">{metadata.text}</span>
      {metadataTrailing && (
        <span className="ml-auto flex shrink-0 items-center">{metadataTrailing}</span>
      )}
    </div>
  );

  return (
    <article
      className={cn(
        'flex overflow-hidden rounded-2xl bg-background-surface',
        bordered && 'border border-border-default',
        horizontal ? 'flex-row items-stretch' : 'flex-col',
        className,
      )}
      {...rest}
    >
      {image && (
        // `text-subtle`, not `text-on-image`: the glyph sits on the warm *placeholder*
        // rather than on a photo, and white on `brand-100` is unreadable.
        <div
          className={cn(
            'flex shrink-0 items-center justify-center bg-background-image-placeholder-warm text-text-subtle',
            imageSizing,
          )}
        >
          {image === true ? <Icon name="image" size={32} /> : image}
        </div>
      )}

      {/* 세로형 컨텐츠 패딩은 .pen의 p-4에서 p-2로 조정됨(제품 요청) — 포스터
          그리드가 더 촘촘하게 읽힌다. */}
      <div
        className={cn(
          // flex-1: 가로형에서 남은 폭을 채워 metadataTrailing이 카드 오른쪽
          // 끝에 정렬되게 한다(세로형에서는 영향 없음).
          'flex min-w-0 flex-1 flex-col',
          contentClassName ?? (horizontal ? 'gap-1 p-3' : 'gap-2 p-2'),
        )}
      >
        {metadataPosition === 'top' && metadataRow}
        {/* 제목·설명은 한 묶음으로 붙인다 — justify-between일 때도 함께 움직인다. */}
        <div className="flex min-w-0 flex-col gap-1">
          {/* Single line with ellipsis — the .pen title is a non-wrapping text node. */}
          <h3 className={cn(titleClassName ?? 'type-heading-sm', 'truncate text-text-default')}>
            {title}
          </h3>
          {description && <p className="type-body-md text-text-secondary">{description}</p>}
        </div>
        {metadataPosition === 'bottom' && metadataRow}
      </div>
    </article>
  );
}
