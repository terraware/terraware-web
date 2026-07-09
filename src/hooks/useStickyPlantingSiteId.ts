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

const useStickyPlantingSiteId = (preferenceName: string) => {
  const { selectedOrganization } = useOrganization();
  const updateUserPreferences = useUpdateUserPreferences();
  const { currentData: orgPreferencesData } = useGetUserPreferencesQuery(selectedOrganization?.id, {
    skip: !selectedOrganization,
  });

  const [selectedPlantingSiteId, setSelectedPlantingSiteId] = useState<PlantingSiteId>(ALL_PLANTING_SITES);
  useEffect(() => {
    if (selectedOrganization) {
      const stickyPlantingSite = orgPreferencesData?.preferences?.[preferenceName];
      if (stickyPlantingSite) {
        const storedPlantingSiteId = stickyPlantingSite.plantingSiteId;
        const isAllPlantingSites =
          storedPlantingSiteId === ALL_PLANTING_SITES || Number(storedPlantingSiteId) === LEGACY_ALL_PLANTING_SITES;
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSelectedPlantingSiteId(isAllPlantingSites ? ALL_PLANTING_SITES : Number(storedPlantingSiteId));
      }
    }
  }, [selectedOrganization, preferenceName, orgPreferencesData]);

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
    selectPlantingSite,
    selectedPlantingSiteId,
  };
};

export default useStickyPlantingSiteId;
