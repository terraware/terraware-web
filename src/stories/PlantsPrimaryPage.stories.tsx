import { useState } from 'react';
import { Story } from '@storybook/react';
import PlantsPrimaryPageView, {
  PlantsPrimaryPageViewProps,
} from 'src/components/PlantsPrimaryPage/PlantsPrimaryPageView';

const PlantsPrimaryPageViewTemplate: Story<Omit<PlantsPrimaryPageViewProps, 'onSelect'>> = (args) => {
  const [id, setId] = useState<number | undefined>(args.selectedPlantingSiteId);

  return (
    <PlantsPrimaryPageView {...args} onSelect={(site) => setId(site.id)} selectedPlantingSiteId={id}>
      <div>Selected {id}</div>
    </PlantsPrimaryPageView>
  );
};

export default {
  title: 'PlantsPrimaryPageView',
  component: PlantsPrimaryPageView,
};

export const Default = PlantsPrimaryPageViewTemplate.bind({});

Default.args = {
  title: 'Cloudforest Sites',
  isEmptyState: true,
  plantingSites: [
    { name: 'Monteverde', id: 5, organizationId: 1 },
    { name: 'Amazon', id: 99, organizationId: 1 },
    { name: 'Congo', id: 3, organizationId: 1 },
  ],
  selectedPlantingSiteId: 99,
};
