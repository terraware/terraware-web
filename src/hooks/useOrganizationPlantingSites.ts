import { useCallback, useEffect, useMemo } from 'react';

import { useLocalization, useOrganization } from 'src/providers';
import { PlantingSitePayload, useLazyListPlantingSitesQuery } from 'src/queries/generated/plantingSites';

const useOrganizationPlantingSites = (full?: boolean) => {
  const { activeLocale, strings } = useLocalization();
  const { selectedOrganization } = useOrganization();
  const [listPlantingSites, listPlantingSitesResponse] = useLazyListPlantingSitesQuery();

  const plantingSites = useMemo(
    () =>
      (listPlantingSitesResponse.currentData?.sites ?? []).toSorted((a, b) =>
        a.name.localeCompare(b.name, activeLocale || undefined)
      ),
    [activeLocale, listPlantingSitesResponse]
  );

  const reload = useCallback(
    (preferCacheValue?: boolean) => {
      if (selectedOrganization) {
        void listPlantingSites(
          { organizationId: selectedOrganization.id, full, includeZones: false },
          preferCacheValue
        );
      }
    },
    [full, listPlantingSites, selectedOrganization]
  );

  useEffect(() => {
    reload(true);
  }, [reload]);

  const plantingSitesWithAllSitesOption = useMemo(() => {
    if (selectedOrganization) {
      const allOption: PlantingSitePayload = {
        adHocPlots: [],
        id: -1,
        name: strings.ALL_PLANTING_SITES,
        organizationId: selectedOrganization.id,
        plantingSeasons: [],
      };
      return [allOption, ...plantingSites];
    }
    return plantingSites;
  }, [plantingSites, selectedOrganization, strings.ALL_PLANTING_SITES]);

  return {
    isLoading: listPlantingSitesResponse.isFetching,
    isSuccess: listPlantingSitesResponse.isSuccess,
    plantingSites,
    plantingSitesWithAllSitesOption,
    reload,
  };
};

export default useOrganizationPlantingSites;
