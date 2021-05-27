import { Story } from '@storybook/react';
import React from 'react';
import SummaryBox, {
  Props as SummaryBoxProps,
} from '../components/common/SummaryBox';

//👇 This default export determines where your story goes in the story list
export default {
  title: 'SummaryBox',
  component: SummaryBox,
};

//👇 We create a “template” of how args map to rendering
const Template: Story<SummaryBoxProps> = (args) => <SummaryBox {...args} />;

export const Default = Template.bind({});
Default.args = {
  id: '1',
  title: 'Summary Box',
  value: 'Summary box example test',
  variant: 'default',
};

export const Available = Template.bind({});
Available.args = {
  id: '1',
  title: 'Summary Box',
  value: 'Summary box example test',
  variant: 'available',
};

export const Zero = Template.bind({});
Zero.args = {
  id: '1',
  title: 'Summary Box',
  value: 'Summary box example test',
  variant: 'zero',
};
