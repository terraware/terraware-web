// YourComponent.stories.js

import { Story } from '@storybook/react';
import React from 'react';
import RadioButton, {
  Props as RadioButtonProps,
} from '../components/common/RadioButton';

//👇 This default export determines where your story goes in the story list
export default {
  title: 'RadioButton',
  component: RadioButton,
};

//👇 We create a “template” of how args map to rendering
const Template: Story<RadioButtonProps> = (args) => {
  return <RadioButton {...args} />;
};

export const Default = Template.bind({});

Default.args = {
  id: '1',
  name: 'Test',
  label: <p>Test</p>,
  value: false,
};
