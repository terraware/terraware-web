import { useCallback, useEffect, useState } from 'react';

import strings from 'src/strings';
import useSnackbar from 'src/utils/useSnackbar';

import { SubLocationService } from '../../../services';
import { SubLocationsResponse } from '../../../services/SubLocationService';
import { SubLocation } from '../../../types/Facility';

export const useSubLocations = (nurseryId?: number, record?: { subLocationIds?: number[]; facilityId?: number }) => {
  const snackbar = useSnackbar();

  const [availableSubLocations, setAvailableSubLocations] = useState<SubLocation[]>();
  const [selectedSubLocations, setSelectedSubLocations] = useState<SubLocation[]>();

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
    if (availableSubLocations && record?.subLocationIds) {
      setSelectedSubLocations(
        availableSubLocations.filter((subLocation) =>
          (record.subLocationIds || []).find((subLocationId) => subLocation.id === subLocationId)
        )
      );
    }
  }, [availableSubLocations, record?.subLocationIds]);

  useEffect(() => {
    void initSubLocations();
  }, [initSubLocations]);

  return { availableSubLocations, selectedSubLocations };
};
