import { useMemo } from 'react';

import { useOrganization, useUser } from 'src/providers/hooks';
import { useGetObservationResultsQuery } from 'src/queries/generated/observations';
import { useGetPlantingSiteQuery } from 'src/queries/generated/plantingSites';

type CanUpdateActivityObservation = {
  canUpdate: boolean;
  isResolved: boolean;
};

const useCanUpdateActivityObservation = (observationId?: number): CanUpdateActivityObservation => {
  const { isAllowed } = useUser();
  const { organizations } = useOrganization();

  const { data: observationResults, isError: isObservationError } = useGetObservationResultsQuery(
    { observationId: observationId as number },
    { skip: observationId === undefined }
  );

  const plantingSiteId = observationResults?.observation.plantingSiteId;

  const { data: plantingSiteData, isError: isPlantingSiteError } = useGetPlantingSiteQuery(
    { id: plantingSiteId as number, includeZones: false, simplified: true },
    { skip: plantingSiteId === undefined }
  );

  const organizationId = plantingSiteData?.site.organizationId;

  return useMemo(
    () => ({
      canUpdate: isAllowed('UPDATE_OBSERVATION', { organizationId, organizations }),
      isResolved: organizationId !== undefined || isObservationError || isPlantingSiteError,
    }),
    [isAllowed, isObservationError, isPlantingSiteError, organizationId, organizations]
  );
};

export default useCanUpdateActivityObservation;
