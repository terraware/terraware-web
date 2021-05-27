// YourComponent.stories.js

import { Story } from '@storybook/react';
import React from 'react';
import Table, { Props as TableProps } from '../components/common/table/index';

//👇 This default export determines where your story goes in the story list
export default {
  title: 'Table',
  component: Table,
};

//👇 We create a “template” of how args map to rendering
const Template: Story<TableProps<{ name: string; lastname: string }>> = (
  args
) => {
  return <Table {...args} />;
};

export const Default = Template.bind({});

Default.args = {
  orderBy: 'name',
  columns: [
    { key: 'name', name: 'Name', type: 'string' },
    { key: 'lastname', name: 'Lastname', type: 'string' },
  ],
  rows: [
    { name: 'Constanza', lastname: 'Uanini' },
    { name: 'Carlos', lastname: 'Thurber' },
  ],
};
