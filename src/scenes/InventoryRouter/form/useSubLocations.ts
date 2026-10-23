import { useEffect, useMemo } from 'react';

import { useFacilitySubLocations } from 'src/components/common/SubLocations/useFacilitySubLocations';
import strings from 'src/strings';
import { SubLocation } from 'src/types/Facility';
import useSnackbar from 'src/utils/useSnackbar';

export const useSubLocations = (nurseryId?: number, record?: { subLocationIds?: number[]; facilityId?: number }) => {
  const snackbar = useSnackbar();
  const { subLocations: availableSubLocations, isError } = useFacilitySubLocations(nurseryId || record?.facilityId);

  useEffect(() => {
    if (isError) {
      snackbar.toastError(strings.ERROR_LOAD_SUB_LOCATIONS);
    }
  }, [isError, snackbar]);

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

  return { availableSubLocations, selectedSubLocations };
};
