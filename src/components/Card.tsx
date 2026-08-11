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
  /** Small icon + text line under the description. */
  metadata?: { icon: string; text: string };
  /** Pass `true` for the bare warm placeholder, or a node to fill the area. */
  image?: React.ReactNode | true;
  orientation?: CardOrientation;
  /**
   * Replaces the image area's default sizing classes (`h-[150px] w-full`
   * vertical, `size-24` horizontal) — e.g. an aspect-ratio box for fluid grids.
   */
  imageClassName?: string;
}

export function Card({
  title,
  description,
  metadata,
  image,
  orientation = 'vertical',
  imageClassName,
  className,
  ...rest
}: CardProps) {
  const horizontal = orientation === 'horizontal';
  const imageSizing = imageClassName ?? (horizontal ? 'size-24' : 'h-[150px] w-full');

  return (
    <article
      className={cn(
        'flex overflow-hidden rounded-2xl border border-border-default bg-background-surface',
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

      <div className={cn('flex min-w-0 flex-col', horizontal ? 'gap-1 p-3' : 'gap-2 p-4')}>
        {/* Single line with ellipsis — the .pen title is a non-wrapping text node. */}
        <h3 className="type-heading-sm truncate text-text-default">{title}</h3>
        {description && <p className="type-body-md text-text-secondary">{description}</p>}
        {metadata && (
          <div className="flex items-center gap-[5px]">
            <span className="text-text-disabled">
              <Icon name={metadata.icon} size={16} />
            </span>
            <span className="type-label-md text-text-secondary">{metadata.text}</span>
          </div>
        )}
      </div>
    </article>
  );
}
