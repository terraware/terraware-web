import { useState } from 'react';
import { Story } from '@storybook/react';
import ListMapSelector, { View, ListMapSelectorProps } from 'src/components/common/ListMapSelector';

const ListMapSelectorTemplate: Story<ListMapSelectorProps> = (args) => {
  const [view, setView] = useState<View>(args.view);

  return <ListMapSelector view={view} onView={setView} />;
};

export default {
  title: 'ListMapSelector',
  component: ListMapSelector,
};

export const DefaultList = ListMapSelectorTemplate.bind({});

DefaultList.args = {
  view: 'list',
};

export const DefaultMap = ListMapSelectorTemplate.bind({});

DefaultMap.args = {
  view: 'map',
};
