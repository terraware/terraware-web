// YourComponent.stories.js

import MomentUtils from '@date-io/moment';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import { Story } from '@storybook/react';
import React, { ReactElement } from 'react';
import DatePicker, {
  Props as DatePickerProps,
} from '../components/common/DatePicker';

//👇 This default export determines where your story goes in the story list
export default {
  title: 'DatePicker',
  component: DatePicker,
  decorators: [
    (
      Story: typeof React.Component
    ): ReactElement<typeof MuiPickersUtilsProvider> => {
      return (
        <MuiPickersUtilsProvider utils={MomentUtils}>
          <Story />
        </MuiPickersUtilsProvider>
      );
    },
  ],
};

//👇 We create a “template” of how args map to rendering
const Template: Story<DatePickerProps> = (args) => {
  return <DatePicker {...args} />;
};

export const Default = Template.bind({});

Default.args = {
  id: '1',
  label: 'Datepicker',
};
