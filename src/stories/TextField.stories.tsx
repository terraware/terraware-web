import { Story } from '@storybook/react';
import React from 'react';
import TextField, {
  Props as TextFieldProps,
} from '../components/common/TextField';

//👇 This default export determines where your story goes in the story list
export default {
  title: 'TextField',
  component: TextField,
};

//👇 We create a “template” of how args map to rendering
const Template: Story<TextFieldProps> = (args) => {
  const [value, setValue] = React.useState('');
  const handleChange = (id: string, _value: unknown) => {
    setValue(_value as string);
  };
  return <TextField {...args} value={value} onChange={handleChange} />;
};

export const Default = Template.bind({});

Default.args = {
  id: '1',
  label: 'TextField',
};
