import { useEffect, useMemo } from 'react';

import { useOrganization } from 'src/providers';
import { useLazyListPlantingSitesQuery } from 'src/queries/generated/plantingSites';

const useOrganizationPlantingSites = () => {
  const { selectedOrganization } = useOrganization();
  const [listPlantingSites, listPlantingSitesResponse] = useLazyListPlantingSitesQuery();
  const allPlantingSites = useMemo(
    () => listPlantingSitesResponse.currentData?.sites ?? [],
    [listPlantingSitesResponse]
  );

  useEffect(() => {
    if (selectedOrganization) {
      void listPlantingSites({ organizationId: selectedOrganization.id, includeZones: false }, true);
    }
  }, [listPlantingSites, selectedOrganization]);

  return allPlantingSites;
};

export default useOrganizationPlantingSites;
