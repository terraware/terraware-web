import React, { useState } from 'react';

import { StoryFn } from '@storybook/react';

import CurrentViewSelect, {
  CurrentViewSelectProps,
  DEFAULT_VIEW,
} from 'src/components/common/CurrentView/CurrentViewSelect';

const CurrentViewTemplate: StoryFn<CurrentViewSelectProps> = (args) => {
  const [selected, setSelected] = useState(args.selected);

  return (
    <div style={{ width: '250px' }}>
      <CurrentViewSelect {...args} selected={selected} onChange={setSelected} />
    </div>
  );
};

export default {
  title: 'CurrentView',
  component: CurrentViewSelect,
};

const presetViews = [
  { label: 'Accelerator Projects', value: 'acceleratorProjects' },
  { label: 'Applicants', value: 'applicants' },
];

const myViews = [
  { label: 'Phase 1 Projects', value: 'phase1Projects' },
  { label: 'High Priority', value: 'highPriority' },
];

export const DefaultOnly = CurrentViewTemplate.bind({});

DefaultOnly.args = {
  selected: DEFAULT_VIEW,
};

export const WithPresetViews = CurrentViewTemplate.bind({});

WithPresetViews.args = {
  presetViews,
  selected: 'acceleratorProjects',
};

export const WithMyViews = CurrentViewTemplate.bind({});

WithMyViews.args = {
  myViews,
  selected: DEFAULT_VIEW,
};

export const WithPresetAndMyViews = CurrentViewTemplate.bind({});

WithPresetAndMyViews.args = {
  myViews,
  presetViews,
  selected: 'acceleratorProjects',
};

export const WithoutDefaultView = CurrentViewTemplate.bind({});

WithoutDefaultView.args = {
  defaultViewLabel: null,
  myViews,
  presetViews,
  selected: 'acceleratorProjects',
};

export const WithSaveButton = CurrentViewTemplate.bind({});

WithSaveButton.args = {
  myViews,
  presetViews,
  selected: 'acceleratorProjects',
  showSave: true,
};

export const Modified = CurrentViewTemplate.bind({});

Modified.args = {
  modified: true,
  myViews,
  presetViews,
  selected: 'acceleratorProjects',
  showSave: true,
};

export const WithRename = CurrentViewTemplate.bind({});

WithRename.args = {
  myViews,
  onDeleteView: () => undefined,
  onRenameView: () => undefined,
  presetViews,
  selected: 'phase1Projects',
};
