import { useMemo } from 'react';

import useAcceleratorConsole from 'src/hooks/useAcceleratorConsole';
import { ALL_PLANTING_SITES } from 'src/hooks/useStickyPlantingSiteId';
import { useLocalization, useOrganization } from 'src/providers';
import { useSpeciesData } from 'src/providers/Species/SpeciesContext';
import { useListPlantingSitesQuery } from 'src/queries/generated/plantingSites';

// Loads the planting sites the dashboard should display, scoped to the selected project via the
// backend `projectId` filter (no client-side filtering). Shared by the dashboard view and header so
// they stay consistent.
const useDashboardPlantingSites = (projectId: number | typeof ALL_PLANTING_SITES) => {
  const { activeLocale } = useLocalization();
  const { selectedOrganization } = useOrganization();
  const { acceleratorOrganizationId } = useSpeciesData();
  const { isAcceleratorRoute } = useAcceleratorConsole();

  const organizationId = (isAcceleratorRoute ? acceleratorOrganizationId : undefined) ?? selectedOrganization?.id;
  const isProjectSelected = typeof projectId === 'number';

  const { currentData, isFetching, isSuccess } = useListPlantingSitesQuery(
    { organizationId, projectId: isProjectSelected ? projectId : undefined, includeStrata: false },
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
