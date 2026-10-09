import { useCallback, useEffect, useState } from 'react';

import useUpdateUserPreferences from 'src/hooks/useUpdateUserPreferences';
import { useOrganization } from 'src/providers';
import { useGetUserPreferencesQuery } from 'src/queries/generated/preferences';

// Selecting 'all' means "all planting sites" (no single site filter).
export const ALL_PLANTING_SITES = 'all';
export type PlantingSiteId = number | typeof ALL_PLANTING_SITES;

// The backend historically stored -1 to mean "all planting sites". We now persist 'all', but still
// translate the legacy -1 value to 'all' when reading existing preferences.
const LEGACY_ALL_PLANTING_SITES = -1;

const getStoredPlantingSiteId = (
  preferences: Record<string, unknown> | undefined,
  preferenceName: string
): PlantingSiteId | undefined => {
  const stickyPlantingSite = preferences?.[preferenceName] as { plantingSiteId?: PlantingSiteId } | undefined;
  if (!stickyPlantingSite) {
    return undefined;
  }
  const storedPlantingSiteId = stickyPlantingSite.plantingSiteId;
  const isAllPlantingSites =
    storedPlantingSiteId === ALL_PLANTING_SITES || Number(storedPlantingSiteId) === LEGACY_ALL_PLANTING_SITES;
  return isAllPlantingSites ? ALL_PLANTING_SITES : Number(storedPlantingSiteId);
};

const useStickyPlantingSiteId = (preferenceName: string) => {
  const { selectedOrganization } = useOrganization();
  const organizationId = selectedOrganization?.id;
  const updateUserPreferences = useUpdateUserPreferences();

  const { currentData: preferencesData, isError: preferencesFailed } = useGetUserPreferencesQuery(organizationId, {
    skip: organizationId === undefined,
  });
  const preferencesLoaded = preferencesData !== undefined || preferencesFailed;
  const preferences = preferencesData?.preferences;

  const [selectedPlantingSiteId, setSelectedPlantingSiteId] = useState<PlantingSiteId>(
    () => (preferencesLoaded ? getStoredPlantingSiteId(preferences, preferenceName) : undefined) ?? ALL_PLANTING_SITES
  );
  // Restoring ends in the same render that applies the stored selection, so consumers never act on the placeholder
  // selection that precedes it.
  const [restoredOrganizationId, setRestoredOrganizationId] = useState(() =>
    preferencesLoaded ? organizationId : undefined
  );
  useEffect(() => {
    if (organizationId === undefined || !preferencesLoaded) {
      return;
    }
    const storedPlantingSiteId = getStoredPlantingSiteId(preferences, preferenceName);
    if (storedPlantingSiteId !== undefined) {
      setSelectedPlantingSiteId(storedPlantingSiteId);
    }
    setRestoredOrganizationId(organizationId);
  }, [organizationId, preferenceName, preferences, preferencesLoaded]);

  const isRestoring = organizationId !== undefined && restoredOrganizationId !== organizationId;

  const selectPlantingSite = useCallback(
    (nextPlantingSiteId: PlantingSiteId) => {
      setSelectedPlantingSiteId(nextPlantingSiteId);

      if (selectedOrganization && nextPlantingSiteId !== selectedPlantingSiteId) {
        void updateUserPreferences(
          { [preferenceName]: { plantingSiteId: nextPlantingSiteId } },
          selectedOrganization.id
        ).catch(() => undefined);
      }
    },
    [preferenceName, selectedOrganization, selectedPlantingSiteId, updateUserPreferences]
  );

  return {
    isRestoring,
    selectPlantingSite,
    selectedPlantingSiteId,
  };
};

export default useStickyPlantingSiteId;
