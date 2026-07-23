import { useMemo } from 'react';

import useAcceleratorConsole from 'src/hooks/useAcceleratorConsole';
import { ALL_PLANTING_SITES } from 'src/hooks/useStickyPlantingSiteId';
import { useLocalization } from 'src/providers';
import { useListPlantingSitesQuery } from 'src/queries/generated/plantingSites';

// Loads the planting sites the dashboard should display, scoped to the selected project via the
// backend `projectId` filter (no client-side filtering). Shared by the dashboard view and header so
// they stay consistent. `organizationId` is resolved by the caller (PlantsDashboardView) so accelerator
// routes can target the project's organization.
const useDashboardPlantingSites = (projectId: number | typeof ALL_PLANTING_SITES, organizationId?: number) => {
  const { activeLocale } = useLocalization();
  const { isAcceleratorRoute } = useAcceleratorConsole();

  const isProjectSelected = typeof projectId === 'number';

  const { currentData, isFetching, isSuccess } = useListPlantingSitesQuery(
    { organizationId, projectId: isProjectSelected ? projectId : undefined, includeZones: false },
    { skip: organizationId === undefined }
  );

  const plantingSites = useMemo(
    () => (currentData?.sites ?? []).toSorted((a, b) => a.name.localeCompare(b.name, activeLocale || undefined)),
    [activeLocale, currentData]
  );

  const showAllSitesOption = (isAcceleratorRoute || isProjectSelected) && plantingSites.length > 1;

  return { organizationId, plantingSites, showAllSitesOption, isLoading: isFetching, isSuccess };
};

export default useDashboardPlantingSites;
