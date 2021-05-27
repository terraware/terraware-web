// YourComponent.stories.js

import { action } from '@storybook/addon-actions';
import { Story } from '@storybook/react';
import React from 'react';
import DialogCloseButton, {
  Props as DialogCloseButtonProps,
} from '../components/common/DialogCloseButton';

//👇 This default export determines where your story goes in the story list
export default {
  title: 'DialogCloseButton',
  component: DialogCloseButton,
};

//👇 We create a “template” of how args map to rendering
const Template: Story<DialogCloseButtonProps> = (args) => (
  <DialogCloseButton {...args} />
);

export const Default = Template.bind({});

Default.args = {
  onClick: () => {
    action('onClick')();
  },
};
