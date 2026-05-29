import { useCallback, useEffect, useMemo } from 'react';

import { useLocalization, useOrganization } from 'src/providers';
import { PlantingSitePayload, useLazyListPlantingSitesQuery } from 'src/queries/generated/plantingSites';

type UseOrganizationPlantingSitesProps = {
  full?: boolean;
  organizationId?: number;
};

export type OrganizationPlantingSite = Omit<PlantingSitePayload, 'plantingSeasons'>;

const stripPlantingSeasons = ({ plantingSeasons: _omit, ...rest }: PlantingSitePayload): OrganizationPlantingSite =>
  rest;

const useOrganizationPlantingSites = (props?: UseOrganizationPlantingSitesProps) => {
  const { full, organizationId: organizationIdProp } = props ?? {};
  const { activeLocale, strings } = useLocalization();
  const { selectedOrganization } = useOrganization();
  const [listPlantingSites, listPlantingSitesResponse] = useLazyListPlantingSitesQuery();

  const orgId = organizationIdProp ?? selectedOrganization?.id;

  const plantingSites = useMemo<OrganizationPlantingSite[]>(
    () =>
      (listPlantingSitesResponse.currentData?.sites ?? [])
        .map(stripPlantingSeasons)
        .toSorted((a, b) => a.name.localeCompare(b.name, activeLocale || undefined)),
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

  const plantingSitesWithAllSitesOption = useMemo<OrganizationPlantingSite[]>(() => {
    if (orgId) {
      const allOption: OrganizationPlantingSite = {
        adHocPlots: [],
        id: -1,
        name: strings.ALL_PLANTING_SITES,
        organizationId: orgId,
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
