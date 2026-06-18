import { useCallback, useEffect, useState } from 'react';

import { useOrganization } from 'src/providers';
import { CachedUserService, PreferencesService } from 'src/services';

// Selecting 'all' means "all planting sites" (no single site filter).
export const ALL_PLANTING_SITES = 'all';
export type PlantingSiteId = number | typeof ALL_PLANTING_SITES;

// The backend historically stored -1 to mean "all planting sites". We now persist 'all', but still
// translate the legacy -1 value to 'all' when reading existing preferences.
const LEGACY_ALL_PLANTING_SITES = -1;

const useStickyPlantingSiteId = (preferenceName: string) => {
  const { selectedOrganization } = useOrganization();

  const [selectedPlantingSiteId, setSelectedPlantingSiteId] = useState<PlantingSiteId>(ALL_PLANTING_SITES);
  useEffect(() => {
    if (selectedOrganization) {
      const response = CachedUserService.getUserOrgPreferences(selectedOrganization.id);
      const stickyPlantingSite = response[preferenceName];
      if (stickyPlantingSite) {
        const storedPlantingSiteId = stickyPlantingSite.plantingSiteId;
        const isAllPlantingSites =
          storedPlantingSiteId === ALL_PLANTING_SITES || Number(storedPlantingSiteId) === LEGACY_ALL_PLANTING_SITES;
        setSelectedPlantingSiteId(isAllPlantingSites ? ALL_PLANTING_SITES : Number(storedPlantingSiteId));
      }
    }
  }, [selectedOrganization, preferenceName]);

  const selectPlantingSite = useCallback(
    (nextPlantingSiteId: PlantingSiteId) => {
      setSelectedPlantingSiteId(nextPlantingSiteId);

      if (selectedOrganization && nextPlantingSiteId !== selectedPlantingSiteId) {
        void PreferencesService.updateUserOrgPreferences(selectedOrganization.id, {
          [preferenceName]: { plantingSiteId: nextPlantingSiteId },
        });
      }
    },
    [preferenceName, selectedOrganization, selectedPlantingSiteId]
  );

  return {
    selectPlantingSite,
    selectedPlantingSiteId,
  };
};

export default useStickyPlantingSiteId;
