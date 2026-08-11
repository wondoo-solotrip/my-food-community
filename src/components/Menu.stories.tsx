import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { Menu, MenuItem } from './Menu';

const meta = {
  title: 'Components/Menu',
  component: Menu,
  tags: ['autodocs'],
  args: { label: '게시물 메뉴' },
} satisfies Meta<typeof Menu>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * The design file's own composition: two default items, one disabled and one
 * destructive, stacked with a 4px gap inside a 280px floating surface.
 */
export const Default: Story = {
  render: (args) => (
    <Menu {...args}>
      <MenuItem label="프로필 편집" leadingIcon="edit" />
      <MenuItem label="알림 설정" leadingIcon="settings" />
      <MenuItem label="공유 준비 중" leadingIcon="share" state="disabled" />
      <MenuItem label="게시물 삭제" leadingIcon="delete" type="destructive" />
    </Menu>
  ),
};

/** Items follow the size of the menu they sit in, per the guide. */
export const Sizes: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex items-start gap-6">
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <div key={size} className="flex flex-col gap-2">
          <h3 className="text-[11px] font-semibold tracking-wide text-text-subtle uppercase">
            {size}
          </h3>
          <Menu label={`${size} 메뉴`}>
            <MenuItem label="프로필 편집" leadingIcon="edit" size={size} />
            <MenuItem label="게시물 삭제" leadingIcon="delete" type="destructive" size={size} />
          </Menu>
        </div>
      ))}
    </div>
  ),
};
