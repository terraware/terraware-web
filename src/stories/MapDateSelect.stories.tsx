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
    dates: ['2023-05-01', '2023-01-01', '2022-05-01', '2022-03-01', '2022-01-01'],
    onChange: () => undefined,
  },
};

export const SingleOption: Story = {
  args: {
    dates: ['2023-05'],
    onChange: () => undefined,
  },
};
