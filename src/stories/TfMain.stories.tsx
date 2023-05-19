import type { Meta, StoryObj } from '@storybook/react';

import TfMain from 'src/components/common/TfMain';

const meta = {
  title: 'TfMain',
  component: TfMain,
  parameters: {
    // More on how to position stories at: https://storybook.js.org/docs/react/configure/story-layout
    layout: 'fullscreen',
  },
} satisfies Meta<typeof TfMain>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    backgroundImageVisible: true,
    children: <p>This is the TFMain page.</p>,
  },
};
