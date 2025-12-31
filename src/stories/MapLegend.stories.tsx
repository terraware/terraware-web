import { Meta, StoryObj } from '@storybook/react';

import MapLegend from 'src/components/common/MapLegend';

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
    legends: [
      {
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
      {
        title: 'Regions',
        items: [
          {
            fillColor: '#990000',
            borderColor: '#550000',
            label: 'Planting Site',
          },
          {
            fillColor: '#0000ff',
            borderColor: '#000099',
            label: 'Stratum',
          },
          {
            fillColor: '#ff0000',
            borderColor: '#000000',
            label: 'Substratum',
          },
        ],
      },
    ],
  },
};
