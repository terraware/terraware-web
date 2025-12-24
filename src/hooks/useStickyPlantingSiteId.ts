import { useCallback, useEffect, useState } from 'react';

import { useOrganization } from 'src/providers';
import { CachedUserService, PreferencesService } from 'src/services';

const useStickyPlantingSiteId = (preferenceName: string, defaultValue?: number | undefined) => {
  const { selectedOrganization } = useOrganization();

  const [selectedPlantingSiteId, setSelectedPlantingSiteId] = useState<number | undefined>(defaultValue);
  useEffect(() => {
    if (selectedOrganization) {
      const response = CachedUserService.getUserOrgPreferences(selectedOrganization.id);
      const stickyPlantingSite = response[preferenceName];
      if (stickyPlantingSite) {
        const lastPlantingSiteId = Number(stickyPlantingSite.plantingSiteId);
        setSelectedPlantingSiteId(lastPlantingSiteId);
      }
    }
  }, [selectedOrganization, preferenceName]);

  const selectPlantingSite = useCallback(
    (nextPlantingSiteId: number) => {
      setSelectedPlantingSiteId(nextPlantingSiteId);

      if (selectedOrganization) {
        if (nextPlantingSiteId !== selectedPlantingSiteId) {
          void PreferencesService.updateUserOrgPreferences(selectedOrganization.id, {
            [preferenceName]: { plantingSiteId: nextPlantingSiteId },
          });
        }
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
