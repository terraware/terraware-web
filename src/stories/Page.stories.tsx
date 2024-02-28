import { Story } from '@storybook/react';
import Page, { PageProps } from 'src/components/Page';
import Button from 'src/components/common/button/Button';
import OptionsMenu from 'src/components/common/OptionsMenu';

const PageTemplate: Story<PageProps> = (args: PageProps) => {
  return <Page {...args} />;
};

export default {
  title: 'Page',
  component: Page,
};

export const PageWithCrumbs = PageTemplate.bind({});

PageWithCrumbs.args = {
  crumbs: [
    {
      name: 'root',
      to: '/root',
    },
    {
      name: 'child',
      to: '/child',
    },
  ],
  title: 'hello world',
  children: 'Test page',
};

export const PageWithCrumbsAndRightComponent = PageTemplate.bind({});

PageWithCrumbsAndRightComponent.args = {
  crumbs: [
    {
      name: 'root',
      to: '/root',
    },
    {
      name: 'child',
      to: '/child',
    },
  ],
  title: 'hello world',
  children: 'Test page',
  rightComponent: (
    <>
      <Button
        label={'Click this button'}
        icon='iconEdit'
        onClick={() => {
          // tslint:disable-next-line:no-console
          console.log('Thank you for clicking me');
        }}
        size='medium'
        id='button'
      />
      <OptionsMenu
        onOptionItemClick={(item) => {
          // tslint:disable-next-line:no-console
          console.log('You clicked on ', item);
        }}
        optionItems={[{ label: 'Click this option', value: 'click' }]}
      />
    </>
  ),
};
