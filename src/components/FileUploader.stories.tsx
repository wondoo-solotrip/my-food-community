import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import {
  FileItem,
  FileUploader,
  type FileItemStatus,
  type UploaderState,
} from './FileUploader';
import { Matrix, Stack } from './docs/Matrix';

const DROPZONE_STATES: UploaderState[] = ['default', 'dragover', 'disabled', 'error'];
const ITEM_STATES: FileItemStatus[] = ['uploading', 'complete', 'error'];

/** Which file item the design file pairs with each dropzone state. */
const PAIRED_ITEM: Record<UploaderState, FileItemStatus> = {
  default: 'complete',
  dragover: 'uploading',
  disabled: 'complete',
  error: 'error',
};

const meta = {
  title: 'Components/File Uploader',
  component: FileUploader,
  tags: ['autodocs'],
  // No `helper` arg: the component owns the per-state default copy.
  args: { state: 'default' },
  argTypes: {
    state: { control: 'inline-radio', options: DROPZONE_STATES },
  },
  decorators: [
    (Story) => (
      <div className="w-[360px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof FileUploader>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args) => (
    <FileUploader {...args}>
      <FileItem name="restaurant-photo.jpg" status={PAIRED_ITEM[args.state ?? 'default']} />
    </FileUploader>
  ),
};

/**
 * The 4 dropzone states, each with the file item the design file pairs it with.
 * DISABLED dims the whole list to 55%, as in `.pen`.
 */
export const DropzoneStates: Story = {
  parameters: { controls: { disable: true } },
  decorators: [],
  render: () => (
    <Stack>
      {DROPZONE_STATES.map((state) => (
        <div key={state} className="w-[360px]">
          <h3 className="mb-3 text-[11px] font-semibold tracking-wide text-text-subtle uppercase">
            {state}
          </h3>
          <FileUploader state={state}>
            <FileItem
              name={state === 'error' ? 'restaurant-photo-too-large.jpg' : 'restaurant-photo.jpg'}
              status={PAIRED_ITEM[state]}
            />
          </FileUploader>
        </div>
      ))}
    </Stack>
  ),
};

/** The 3 `File Item` components, independent of the dropzone's own state. */
export const FileItemStates: Story = {
  parameters: { controls: { disable: true } },
  decorators: [],
  render: () => (
    <Matrix
      rows={['file item']}
      hideRowLabels
      columns={ITEM_STATES}
      render={(_row, column) => (
        <div className="w-[360px]">
          <FileItem
            name={column === 'error' ? 'restaurant-photo-too-large.jpg' : 'restaurant-photo.jpg'}
            status={column as FileItemStatus}
          />
        </div>
      )}
    />
  ),
};
