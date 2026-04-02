import { useCallback, useEffect, useMemo } from 'react';

import { useLocalization, useOrganization } from 'src/providers';
import { PlantingSitePayload, useLazyListPlantingSitesQuery } from 'src/queries/generated/plantingSites';

type UseOrganizationPlantingSitesProps = {
  full?: boolean;
  organizationId?: number;
};

const useOrganizationPlantingSites = (props?: UseOrganizationPlantingSitesProps) => {
  const { full, organizationId: organizationIdProp } = props ?? {};
  const { activeLocale, strings } = useLocalization();
  const { selectedOrganization } = useOrganization();
  const [listPlantingSites, listPlantingSitesResponse] = useLazyListPlantingSitesQuery();

  const orgId = organizationIdProp ?? selectedOrganization?.id;

  const plantingSites = useMemo(
    () =>
      (listPlantingSitesResponse.currentData?.sites ?? []).toSorted((a, b) =>
        a.name.localeCompare(b.name, activeLocale || undefined)
      ),
    [activeLocale, listPlantingSitesResponse]
  );

  const reload = useCallback(
    (preferCacheValue?: boolean) => {
      if (orgId) {
        void listPlantingSites({ organizationId: orgId, full, includeZones: false }, preferCacheValue);
      }
    },
    [full, listPlantingSites, orgId]
  );

  useEffect(() => {
    reload(true);
  }, [reload]);

  const plantingSitesWithAllSitesOption = useMemo(() => {
    if (orgId) {
      const allOption: PlantingSitePayload = {
        adHocPlots: [],
        id: -1,
        name: strings.ALL_PLANTING_SITES,
        organizationId: orgId,
        plantingSeasons: [],
      };
      return [allOption, ...plantingSites];
    }
    return plantingSites;
  }, [orgId, plantingSites, strings.ALL_PLANTING_SITES]);

  return {
    isLoading: listPlantingSitesResponse.isFetching,
    isSuccess: listPlantingSitesResponse.isSuccess,
    plantingSites,
    plantingSitesWithAllSitesOption,
    reload,
  };
};

export default useOrganizationPlantingSites;
