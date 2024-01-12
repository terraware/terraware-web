import { useMemo } from 'react';
import { PlantingSite } from 'src/types/Tracking';
import { SiteType } from 'src/types/PlantingSite';
import { useOrganization } from 'src/providers';
import PlantingSiteEditor from './Editor';

type NewPlantingSiteProps = {
  reloadPlantingSites: () => void;
  siteType: SiteType;
};

export default function NewPlantingSite(props: NewPlantingSiteProps): JSX.Element {
  const { reloadPlantingSites, siteType } = props;
  const { selectedOrganization } = useOrganization();

  const site = useMemo<PlantingSite>(
    () => ({
      id: 0,
      name: '',
      organizationId: selectedOrganization.id,
      plantingSeasons: [],
    }),
    [selectedOrganization.id]
  );

  return <PlantingSiteEditor reloadPlantingSites={reloadPlantingSites} site={site} siteType={siteType} />;
}
