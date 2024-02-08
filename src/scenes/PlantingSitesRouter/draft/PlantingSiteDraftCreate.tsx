import { useMemo } from 'react';
import useQuery from 'src/utils/useQuery';
import { PlantingSite } from 'src/types/Tracking';
import { SiteType } from 'src/types/PlantingSite';
import { useOrganization } from 'src/providers';
import PlantingSiteEditor from 'src/scenes/PlantingSitesRouter/editor/Editor';

type PlantingSiteDraftCreateProps = {
  reloadPlantingSites: () => void;
};

export default function PlantingSiteDraftCreate(props: PlantingSiteDraftCreateProps): JSX.Element {
  const { reloadPlantingSites } = props;
  const { selectedOrganization } = useOrganization();
  const query = useQuery();

  const site = useMemo<PlantingSite>(
    () => ({
      id: 0,
      name: '',
      organizationId: selectedOrganization.id,
      plantingSeasons: [],
    }),
    [selectedOrganization.id]
  );

  const siteType = useMemo<SiteType>(() => query.has('detailed') ? 'detailed' : 'simple', [query]);

  return <PlantingSiteEditor reloadPlantingSites={reloadPlantingSites} site={site} siteType={siteType} />;
}
