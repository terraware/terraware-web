// YourComponent.stories.js

import { Story } from '@storybook/react';
import React from 'react';
import Note, { Props as NoteProps } from '../components/common/Note';

//👇 This default export determines where your story goes in the story list
export default {
  title: 'Note',
  component: Note,
};

//👇 We create a “template” of how args map to rendering
const Template: Story<NoteProps> = (args) => <Note {...args} />;

export const Default = Template.bind({});

Default.args = {
  children: 'Hello',
};
