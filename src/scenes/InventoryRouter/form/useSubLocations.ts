import { useCallback, useEffect, useMemo, useState } from 'react';

import strings from 'src/strings';
import useSnackbar from 'src/utils/useSnackbar';

import { SubLocationService } from '../../../services';
import { SubLocationsResponse } from '../../../services/SubLocationService';
import { SubLocation } from '../../../types/Facility';

export const useSubLocations = (nurseryId?: number, record?: { subLocationIds?: number[]; facilityId?: number }) => {
  const snackbar = useSnackbar();

  const [availableSubLocations, setAvailableSubLocations] = useState<SubLocation[]>();

  const subLocationIds = record?.subLocationIds;
  const selectedSubLocations = useMemo<SubLocation[] | undefined>(
    () =>
      availableSubLocations && subLocationIds
        ? availableSubLocations.filter((subLocation) =>
            (subLocationIds || []).find((subLocationId) => subLocation.id === subLocationId)
          )
        : undefined,
    [availableSubLocations, subLocationIds]
  );

  const initSubLocations = useCallback(async () => {
    const facilityId = nurseryId || record?.facilityId;
    if (!facilityId) {
      return;
    }

    const result: SubLocationsResponse = await SubLocationService.getSubLocations(facilityId);
    if (!result.requestSucceeded || !result.subLocations) {
      snackbar.toastError(strings.ERROR_LOAD_SUB_LOCATIONS);
      return;
    }

    setAvailableSubLocations(result.subLocations);
  }, [nurseryId, record?.facilityId, snackbar]);

  useEffect(() => {
    void initSubLocations();
  }, [initSubLocations]);

  return { availableSubLocations, selectedSubLocations };
};
