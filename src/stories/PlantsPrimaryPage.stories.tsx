import React, { useState } from 'react';

import { Story } from '@storybook/react';

import PlantsPrimaryPageView, {
  PlantsPrimaryPageViewProps,
} from 'src/components/PlantsPrimaryPage/PlantsPrimaryPageView';

const PlantsPrimaryPageViewTemplate: Story<Omit<PlantsPrimaryPageViewProps, 'onSelect'>> = (args) => {
  const [id, setId] = useState<number | undefined>(args.selectedPlantingSiteId);

  return (
    <PlantsPrimaryPageView {...args} onSelect={(site) => setId(site?.id)} selectedPlantingSiteId={id}>
      <div>Selected {id}</div>
    </PlantsPrimaryPageView>
  );
};

export default {
  title: 'PlantsPrimaryPageView',
  component: PlantsPrimaryPageView,
};

export const Default = PlantsPrimaryPageViewTemplate.bind({});
export const ActionButton = PlantsPrimaryPageViewTemplate.bind({});

Default.args = {
  title: 'Cloudforest Sites',
  plantingSites: [
    { name: 'Monteverde', id: 5, organizationId: 1, adHocPlots: [], plantingSeasons: [] },
    { name: 'Amazon', id: 99, organizationId: 1, adHocPlots: [], plantingSeasons: [] },
    { name: 'Congo', id: 3, organizationId: 1, adHocPlots: [], plantingSeasons: [] },
  ],
  selectedPlantingSiteId: 99,
};

ActionButton.args = {
  ...Default.args,
  actionButton: { title: 'Plant Tree', icon: 'plus', onClick: () => window.alert('You planted a tree!!') },
};
