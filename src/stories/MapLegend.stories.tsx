import MapLegend from 'src/components/common/MapLegend';
import { Meta, StoryObj } from '@storybook/react';

const meta = {
  title: 'MapLegend',
  component: MapLegend,
  parameters: {
    // More on how to position stories at: https://storybook.js.org/docs/react/configure/story-layout
    layout: 'fullscreen',
  },
} satisfies Meta<typeof MapLegend>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: 'Boundaries',
    items: [
      {
        fillColor: '#009900',
        borderColor: '#005500',
        label: 'Forest',
      },
      {
        fillColor: '#000099',
        borderColor: '#000055',
        label: 'Water',
      },
      {
        fillColor: '#00ff00',
        borderColor: '#000000',
        label: 'Radioactive Waste',
      },
    ],
  },
};
