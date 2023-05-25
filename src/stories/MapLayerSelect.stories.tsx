import type { Meta, StoryObj } from '@storybook/react';

import MapLayerSelect, { MapLayer } from 'src/components/common/MapLayerSelect';

const meta = {
  title: 'MapLayerSelect',
  component: MapLayerSelect,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof MapLayerSelect>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    initialSelection: ['Planting Site'],
    onUpdateSelection: (selection: MapLayer[]) => alert(selection),
  },
};
