import type { Preview } from '@storybook/nextjs-vite'

import '../src/app/globals.css'

const preview: Preview = {
  // Storybook's docs typography is *unlayered*, so it outranks every Tailwind
  // utility in `@layer utilities` no matter how specific — a `type-label-lg`
  // button label would silently render at the docs' own size on a Docs page.
  // `sb-unstyled` is the official opt-out; `display: contents` keeps the
  // wrapper from affecting layout while still being the DOM ancestor the
  // opt-out selectors look for.
  decorators: [
    (Story) => (
      <div className="sb-unstyled" style={{ display: 'contents' }}>
        <Story />
      </div>
    ),
  ],

  parameters: {
    // Components in src/app import from next/navigation, which needs this.
    nextjs: {
      appDirectory: true,
    },

    // Foundations read in dependency order rather than alphabetically: tokens
    // define the vocabulary the other three pages use. Components then follow
    // the order of the design-system guides (action → form → navigation →
    // feedback → etc), with each component's dependencies ahead of it.
    options: {
      storySort: {
        order: [
          'Introduction',
          'Foundation',
          ['Design Tokens', 'Color', 'Typography', 'Iconography'],
          'Components',
          [
            'Overview',
            'Icon',
            'Icon Button',
            'Button',
            'Text Field',
            'Textarea',
            'Checkbox',
            'Radio',
            'Switch',
            'Select',
            'Select Item',
            'Chip',
            'File Uploader',
            'Top Navigation',
            'Bottom Navigation',
            'Tab Navigation',
            'Spinner',
            'Skeleton',
            'Toast',
            'Card',
            'Badge',
            'Empty State',
            'Modal',
            'Bottom Sheet',
            'Menu',
            'Menu Item',
          ],
        ],
      },
    },

    controls: {
      matchers: {
       color: /(background|color)$/i,
       date: /Date$/i,
      },
    },

    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: 'todo'
    }
  },
};

export default preview;