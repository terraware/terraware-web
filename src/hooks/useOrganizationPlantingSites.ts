import { useEffect, useMemo } from 'react';

import { useOrganization } from 'src/providers';
import { useLazyListPlantingSitesQuery } from 'src/queries/generated/plantingSites';

const useOrganizationPlantingSites = (full?: boolean) => {
  const { selectedOrganization } = useOrganization();
  const [listPlantingSites, listPlantingSitesResponse] = useLazyListPlantingSitesQuery();
  const allPlantingSites = useMemo(
    () => listPlantingSitesResponse.currentData?.sites ?? [],
    [listPlantingSitesResponse]
  );

  useEffect(() => {
    if (selectedOrganization) {
      void listPlantingSites({ organizationId: selectedOrganization.id, full, includeZones: false }, true);
    }
  }, [full, listPlantingSites, selectedOrganization]);

  return allPlantingSites;
};

export default useOrganizationPlantingSites;
