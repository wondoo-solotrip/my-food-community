/**
 * FileUploader and FileItem — `.pen`: `File Uploader / {DEFAULT|DRAGOVER|DISABLED|ERROR}`
 * and `File Item / {UPLOADING|COMPLETE|ERROR}`.
 *
 * One combined type per the guide: the dropzone and the file-picker button are a
 * single control, with the uploaded-file list underneath. The two families are
 * separate components because their states are independent — a dropzone can sit
 * in ERROR while its items read COMPLETE, which is exactly what the .pen shows.
 */
import { Button } from './Button';
import { Icon } from './Icon';
import { IconButton } from './IconButton';
import { Spinner } from './Spinner';
import { cn } from './cn';

/* -- File Item ------------------------------------------------------------- */

export type FileItemStatus = 'uploading' | 'complete' | 'error';

const STATUS_TONE: Record<FileItemStatus, string> = {
  uploading: 'text-text-information',
  complete: 'text-text-success',
  error: 'text-text-error',
};

/** Copy the design file ships for each status. */
const STATUS_TEXT: Record<FileItemStatus, string> = {
  uploading: '업로드 중 · 68%',
  complete: '업로드 완료',
  error: '용량 제한 초과',
};

export interface FileItemProps extends React.ComponentPropsWithoutRef<'div'> {
  name: string;
  status?: FileItemStatus;
  /** Overrides the design-file default for the status line. */
  statusText?: string;
  onRemove?: () => void;
}

export function FileItem({
  name,
  status = 'complete',
  statusText,
  onRemove,
  className,
  ...rest
}: FileItemProps) {
  const isError = status === 'error';

  return (
    <div
      className={cn(
        'flex h-[76px] w-full items-center gap-2.5 rounded-xl border bg-background-surface p-2.5',
        isError ? 'border-border-error' : 'border-border-default',
        className,
      )}
      {...rest}
    >
      <div className="flex size-[52px] shrink-0 items-center justify-center rounded-lg bg-background-image-placeholder text-text-secondary">
        <Icon name="image" size={24} />
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <p className={cn('type-body-md truncate', isError ? 'text-text-error' : 'text-text-default')}>
          {name}
        </p>
        <div className={cn('flex items-center gap-[5px]', STATUS_TONE[status])}>
          {status === 'uploading' ? (
            <Spinner size={16} tone="inherit" />
          ) : (
            <Icon name={status === 'complete' ? 'check' : 'error'} size={16} />
          )}
          <span className="type-label-md">{statusText ?? STATUS_TEXT[status]}</span>
        </div>
      </div>

      <IconButton
        icon="delete"
        label={`${name} 삭제`}
        size={32}
        onClick={onRemove}
        className={isError ? 'text-text-error' : undefined}
      />
    </div>
  );
}

/* -- File Uploader --------------------------------------------------------- */

export type UploaderState = 'default' | 'dragover' | 'disabled' | 'error';

const DROPZONE: Record<UploaderState, string> = {
  default: 'bg-background-surface border border-border-default',
  dragover: 'bg-background-surface border-2 border-border-focus',
  disabled: 'bg-background-disabled border border-border-disabled',
  error: 'bg-background-surface border border-border-error',
};

const DROPZONE_ICON: Record<UploaderState, string> = {
  default: 'text-text-secondary',
  dragover: 'text-text-information',
  disabled: 'text-text-disabled',
  error: 'text-text-error',
};

/** The prompt is `text-default` in DEFAULT, unlike the icon beside it. */
const PROMPT: Record<UploaderState, string> = {
  default: 'text-text-default',
  dragover: 'text-text-information',
  disabled: 'text-text-disabled',
  error: 'text-text-error',
};

const HELPER: Record<UploaderState, string> = {
  default: 'text-text-secondary',
  dragover: 'text-text-secondary',
  disabled: 'text-text-disabled',
  error: 'text-text-error',
};

const PROMPT_TEXT: Record<UploaderState, string> = {
  default: '파일을 끌어 놓거나 직접 선택하세요',
  dragover: '여기에 파일을 놓으세요',
  disabled: '파일을 끌어 놓거나 직접 선택하세요',
  error: '파일을 업로드하지 못했어요',
};

/** Helper copy the design file ships when no caller-supplied helper exists. */
const DEFAULT_HELPER: Record<UploaderState, string> = {
  default: 'JPG · PNG · 최대 10MB',
  dragover: 'JPG · PNG · 최대 10MB',
  disabled: 'JPG · PNG · 최대 10MB',
  error: 'JPG · PNG · 최대 10MB — 파일을 다시 확인해 주세요.',
};

export interface FileUploaderProps extends React.ComponentPropsWithoutRef<'div'> {
  state?: UploaderState;
  /** Format and size limits, shown above the dropzone. Used as given — the
   *  register page supplies its own error copy without the retry suffix. */
  helper?: string;
  promptText?: string;
  onSelect?: () => void;
  /** `FileItem`s. `.pen` dims the whole list to 55% in the DISABLED state. */
  children?: React.ReactNode;
}

export function FileUploader({
  state = 'default',
  helper,
  promptText,
  onSelect,
  className,
  children,
  ...rest
}: FileUploaderProps) {
  const disabled = state === 'disabled';

  return (
    <div className={cn('flex w-full flex-col gap-2', className)} {...rest}>
      <p className={cn('type-label-md', HELPER[state])}>{helper ?? DEFAULT_HELPER[state]}</p>

      <div
        className={cn(
          'flex h-[132px] w-full flex-col items-center justify-center gap-2 rounded-[14px]',
          DROPZONE[state],
        )}
        data-dragover={state === 'dragover' || undefined}
      >
        <span className={DROPZONE_ICON[state]}>
          <Icon name="image" size={24} />
        </span>
        <p className={cn('type-body-md', PROMPT[state])}>{promptText ?? PROMPT_TEXT[state]}</p>
        <Button size="sm" disabled={disabled} onClick={onSelect}>
          파일 선택
        </Button>
      </div>

      {children && (
        <div className={cn('flex flex-col gap-2', disabled && 'opacity-55')}>{children}</div>
      )}
    </div>
  );
}
