import { Story } from '@storybook/react';
import Page, { PageProps } from 'src/components/Page';

const PageTemplate: Story<PageProps> = (args) => {
  return <Page {...args} />;
};

export default {
  title: 'Page',
  component: Page,
};

export const Default = PageTemplate.bind({});

Default.args = {
  content: 'Welcome to wherever you are...',
  title: 'Hello world!',
};
