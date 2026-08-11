import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { MenuItem, type MenuItemSize, type MenuItemState, type MenuItemType } from './Menu';
import { ICON_NAMES } from './Icon';
import { Matrix, Stack } from './docs/Matrix';

const TYPES: MenuItemType[] = ['default', 'destructive'];
const STATES: MenuItemState[] = ['default', 'disabled'];
const SIZES: { size: MenuItemSize; label: string }[] = [
  { size: 'sm', label: 'sm (32)' },
  { size: 'md', label: 'md (40)' },
  { size: 'lg', label: 'lg (48)' },
];

/** Label copy from the design file, per type. */
const LABEL: Record<MenuItemType, string> = { default: '메뉴 항목', destructive: '삭제하기' };
const ICON: Record<MenuItemType, string> = { default: 'edit', destructive: 'delete' };

const meta = {
  title: 'Components/Menu Item',
  component: MenuItem,
  tags: ['autodocs'],
  args: { label: '메뉴 항목', type: 'default', state: 'default', size: 'md', leadingIcon: 'edit' },
  argTypes: {
    type: { control: 'inline-radio', options: TYPES },
    state: { control: 'inline-radio', options: STATES },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    leadingIcon: { control: 'select', options: [undefined, ...ICON_NAMES] },
  },
  decorators: [
    (Story) => (
      <div className="w-[280px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof MenuItem>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/**
 * The 12 `.pen` components. Each item carries its own 1px border because the
 * design file draws them standalone in this matrix — inside a `Menu` they simply
 * stack.
 */
export const AllVariants: Story = {
  parameters: { controls: { disable: true } },
  decorators: [],
  render: () => (
    <Stack>
      {SIZES.map(({ size, label }) => (
        <Matrix
          key={size}
          caption={label}
          rows={TYPES}
          columns={STATES}
          render={(row, column) => {
            const type = row as MenuItemType;
            return (
              <div className="w-[220px]">
                <MenuItem
                  label={LABEL[type]}
                  leadingIcon={ICON[type]}
                  type={type}
                  state={column as MenuItemState}
                  size={size}
                />
              </div>
            );
          }}
        />
      ))}
    </Stack>
  ),
};

/** The leading icon is optional. */
export const WithoutIcon: Story = {
  args: { leadingIcon: undefined },
};
