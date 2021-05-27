// YourComponent.stories.js

import { Story } from '@storybook/react';
import React from 'react';
import Divisor, { Props as DivisorProps } from '../components/common/Divisor';

//👇 This default export determines where your story goes in the story list
export default {
  title: 'Divisor',
  component: Divisor,
  argTypes: {
    mt: {
      description: 'overwritten mt',
      control: {
        type: 'range',
        min: 0,
        max: 5,
        step: 1,
      },
    },
  },
};

//👇 We create a “template” of how args map to rendering
const Template: Story<DivisorProps> = (args) => <Divisor {...args} />;

export const Default = Template.bind({});

Default.args = {
  mt: 3,
};
