import { Story } from '@storybook/react';

import BreadCrumbs, { BreadCrumbsProps } from 'src/components/BreadCrumbs';

const BreadCrumbsTemplate: Story<BreadCrumbsProps> = (args: BreadCrumbsProps) => {
  return <BreadCrumbs {...args} />;
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
