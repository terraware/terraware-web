// YourComponent.stories.js

import { Story } from '@storybook/react';
import React from 'react';
import CancelButton, {
  Props as CancelButtonProps,
} from '../components/common/CancelButton';

//👇 This default export determines where your story goes in the story list
export default {
  title: 'CancelButton',
  component: CancelButton,
};

//👇 We create a “template” of how args map to rendering
const Template: Story<CancelButtonProps> = (args) => {
  return <CancelButton {...args} />;
};

export const Default = Template.bind({});

Default.args = {
  label: 'Cancel',
};
