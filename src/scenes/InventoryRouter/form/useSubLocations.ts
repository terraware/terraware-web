import { useCallback, useEffect, useState } from 'react';
import { SubLocation } from '../../../types/Facility';
import { SubLocationService } from '../../../services';
import { SubLocationsResponse } from '../../../services/SubLocationService';
import strings from 'src/strings';
import useSnackbar from 'src/utils/useSnackbar';

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
