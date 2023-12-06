import { Story } from '@storybook/react';
import BreadCrumbs, { BreadCrumbsProps, Page, PageProps } from 'src/components/BreadCrumbs';
import Button from '../components/common/button/Button';
import OptionsMenu from '../components/common/OptionsMenu';

const BreadCrumbsTemplate: Story<BreadCrumbsProps> = (args: BreadCrumbsProps) => {
  return <BreadCrumbs {...args} />;
};

const PageTemplate: Story<PageProps> = (args: PageProps) => {
  return <Page {...args} />;
};

export default {
  title: 'BreadCrumbs',
  component: BreadCrumbs,
};

export const SingleCrumb = BreadCrumbsTemplate.bind({});

SingleCrumb.args = {
  crumbs: [{ name: 'Hansel', to: '/hansel' }],
};

export const HierarchicalCrumbs = BreadCrumbsTemplate.bind({});

HierarchicalCrumbs.args = {
  hierarchical: true,
  crumbs: [
    {
      name: 'Forest',
      to: '/forest',
    },
    {
      name: 'Road',
      to: '/road',
    },
    {
      name: 'Gretel',
      to: '/gretel',
    },
  ],
};

export const NonHierarchicalCrumbs = BreadCrumbsTemplate.bind({});

NonHierarchicalCrumbs.args = {
  crumbs: [
    {
      name: 'Evil Witch',
      to: '/abc/evil-witch',
    },
    {
      name: 'GingerBread',
      to: '/def/gingerbread',
    },
    {
      name: 'House',
      to: '/xyz/house',
    },
  ],
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
