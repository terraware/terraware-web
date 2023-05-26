import type { Meta, StoryObj } from '@storybook/react';

import MapDateSelect from 'src/components/common/MapDateSelect';

const meta = {
  title: 'MapDateSelect',
  component: MapDateSelect,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof MapDateSelect>;

export default meta;
type Story = StoryObj<typeof meta>;

export const MultipleOptions: Story = {
  args: {
    dates: [new Date(2023, 4), new Date(2023, 0), new Date(2022, 4), new Date(2022, 2), new Date(2022, 0)],
    onChange: () => undefined,
  },
};

export const SingleOption: Story = {
  args: {
    dates: [new Date(2023, 4)],
    onChange: () => undefined,
  },
};
