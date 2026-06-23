import { useCallback, useEffect, useMemo } from 'react';

import { useLocalization, useOrganization } from 'src/providers';
import { useLazyListPlantingSitesQuery } from 'src/queries/generated/plantingSites';

type UseOrganizationPlantingSitesProps = {
  full?: boolean;
  organizationId?: number;
};

const useOrganizationPlantingSites = (props?: UseOrganizationPlantingSitesProps) => {
  const { full, organizationId: organizationIdProp } = props ?? {};
  const { activeLocale } = useLocalization();
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

  return {
    isLoading: listPlantingSitesResponse.isFetching,
    isSuccess: listPlantingSitesResponse.isSuccess,
    plantingSites,
    reload,
  };
};

export default useOrganizationPlantingSites;
