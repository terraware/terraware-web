import { useMemo } from 'react';
import { PlantingSite } from 'src/types/Tracking';
import { SiteType } from 'src/types/PlantingSite';
import { useOrganization } from 'src/providers';
import PlantingSiteCreateFlow from './PlantingSiteCreateFlow';

type PlantingSiteDetailedCreateProps = {
  reloadPlantingSites: () => void;
  siteType: SiteType;
};

export default function PlantingSiteDetailedCreate(props: PlantingSiteDetailedCreateProps): JSX.Element {
  const { reloadPlantingSites, siteType } = props;
  const { selectedOrganization } = useOrganization();

  const site = useMemo<PlantingSite>(
    () => ({
      id: -1,
      name: '',
      organizationId: selectedOrganization.id,
      plantingSeasons: [],
    }),
    [selectedOrganization.id]
  );

  return <PlantingSiteCreateFlow reloadPlantingSites={reloadPlantingSites} site={site} siteType={siteType} />;
}
