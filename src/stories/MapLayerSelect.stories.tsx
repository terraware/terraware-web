import type { Meta, StoryObj } from '@storybook/react';

import MapLayerSelect, { MapLayer } from 'src/components/common/MapLayerSelect';
import strings from 'src/strings';

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
    menuSections: [
      [
        {
          label: strings.PLANTING_SITE,
          value: 'Planting Site',
        },
        {
          label: strings.STRATA,
          value: 'Strata',
        },
        {
          label: strings.SUBSTRATA,
          value: 'Sub-Strata',
        },
        {
          label: strings.MONITORING_PLOTS,
          value: 'Monitoring Plots',
        },
      ],
    ],
  },
};
