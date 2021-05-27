// YourComponent.stories.js

import { action } from '@storybook/addon-actions';
import { Story } from '@storybook/react';
import React from 'react';
import Checkbox, {
  Props as CheckboxProps,
} from '../components/common/Checkbox';

//👇 This default export determines where your story goes in the story list
export default {
  title: 'Checkbox',
  component: Checkbox,
};

//👇 We create a “template” of how args map to rendering
const Template: Story<CheckboxProps> = (args) => {
  const [value, setValue] = React.useState(true);
  const toggleChange = (id: string, _value: boolean) => {
    action('onChange')(_value);
    setValue(_value);
  };

  return <Checkbox {...args} onChange={toggleChange} value={value} />;
};

export const Default = Template.bind({});

Default.args = {
  id: '1',
  name: 'Test',
  label: <p>Test</p>,
  disabled: false,
};
