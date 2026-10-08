import { useMemo } from 'react';

import { skipToken } from '@reduxjs/toolkit/query';
import { DateTime } from 'luxon';

import { ALL_PLANTING_SITES, type PlantingSiteId } from 'src/hooks/useStickyPlantingSiteId';
import { useOrganization } from 'src/providers';
import { ObservationPayload, useListObservationsQuery } from 'src/queries/generated/observations';

const useUpcomingObservations = (plantingSiteId: PlantingSiteId | undefined): ObservationPayload[] => {
  const { selectedOrganization } = useOrganization();
  const { currentData } = useListObservationsQuery(
    selectedOrganization ? { organizationId: selectedOrganization.id } : skipToken
  );

  return useMemo(() => {
    const today = DateTime.now().toISODate();
    return (currentData?.observations ?? [])
      .filter(
        (observation) =>
          observation.state === 'Upcoming' &&
          observation.endDate >= today &&
          (plantingSiteId === ALL_PLANTING_SITES || observation.plantingSiteId === plantingSiteId)
      )
      .toSorted((a, b) => a.startDate.localeCompare(b.startDate) || a.id - b.id);
  }, [currentData?.observations, plantingSiteId]);
};

export default useUpcomingObservations;
