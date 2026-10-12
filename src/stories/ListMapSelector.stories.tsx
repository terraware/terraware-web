import React, { useState } from 'react';

import { StoryFn } from '@storybook/react';

import ListMapSelector, { ListMapSelectorProps, View } from 'src/components/common/ListMapSelector';

const ListMapSelectorTemplate: StoryFn<ListMapSelectorProps> = (args) => {
  const [view, setView] = useState<View>(args.defaultView);

  return <ListMapSelector {...args} view={view} onView={setView} />;
};

export default {
  title: 'ListMapSelector',
  component: ListMapSelector,
};

export const DefaultList = ListMapSelectorTemplate.bind({});

DefaultList.args = {
  defaultView: 'list',
};

export const DefaultMap = ListMapSelectorTemplate.bind({});

DefaultMap.args = {
  defaultView: 'map',
};
