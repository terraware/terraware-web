import { action } from '@storybook/addon-actions';
import { Story } from '@storybook/react';
import React from 'react';
import TextArea from '../components/common/TextArea';
import { Props as TextAreaProps } from '../components/common/TextField';

//👇 This default export determines where your story goes in the story list
export default {
  title: 'TextArea',
  component: TextArea,
};

//👇 We create a “template” of how args map to rendering
const Template: Story<TextAreaProps> = (args) => {
  const [value, setValue] = React.useState('');
  const handleChange = (id: string, _value: unknown) => {
    action('onChange')(_value);
    setValue(_value as string);
  };
  return <TextArea {...args} value={value} onChange={handleChange} />;
};

export const Default = Template.bind({});

Default.args = {
  id: '1',
  label: 'Text Area',
};
