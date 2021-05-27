// YourComponent.stories.js
import { action } from '@storybook/addon-actions';
import { Story } from '@storybook/react';
import React from 'react';
import Dropdown, {
  Props as DropdownProps,
} from '../components/common/Dropdown';

//👇 This default export determines where your story goes in the story list
export default {
  title: 'Dropdown',
  component: Dropdown,
};

//👇 We create a “template” of how args map to rendering
const Template: Story<DropdownProps> = (args) => {
  const [selected, setSelected] = React.useState('');
  const handleChange = (id: string, value: string) => {
    action('onChange')(value);
    setSelected(value);
  };
  return <Dropdown {...args} selected={selected} onChange={handleChange} />;
};

export const Default = Template.bind({});

Default.args = {
  id: '1',
  label: 'Dropdown',
  values: [
    { label: 'One', value: '1' },
    { label: 'Two', value: '2' },
  ],
};
