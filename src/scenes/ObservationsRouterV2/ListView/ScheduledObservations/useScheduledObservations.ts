import { useMemo } from 'react';

import { skipToken } from '@reduxjs/toolkit/query';
import { DateTime } from 'luxon';

import { ALL_PLANTING_SITES, type PlantingSiteId } from 'src/hooks/useStickyPlantingSiteId';
import { useOrganization } from 'src/providers';
import { ObservationPayload, useListObservationsQuery } from 'src/queries/generated/observations';

export type ScheduledObservationSection = 'upcoming' | 'inProgress' | 'overdue';

export type ScheduledObservations = Record<ScheduledObservationSection, ObservationPayload[]>;

const byDate = (key: 'endDate' | 'startDate') => (a: ObservationPayload, b: ObservationPayload) =>
  a[key].localeCompare(b[key]) || a.id - b.id;

const useScheduledObservations = (
  plantingSiteId: PlantingSiteId | undefined
): { isLoaded: boolean; scheduledObservations: ScheduledObservations } => {
  const { selectedOrganization } = useOrganization();
  const { currentData } = useListObservationsQuery(
    selectedOrganization ? { organizationId: selectedOrganization.id } : skipToken
  );

  const scheduledObservations = useMemo(() => {
    const today = DateTime.now().toISODate();
    const observations = (currentData?.observations ?? []).filter(
      (observation) => plantingSiteId === ALL_PLANTING_SITES || observation.plantingSiteId === plantingSiteId
    );

    return {
      upcoming: observations
        .filter((observation) => observation.state === 'Upcoming' && observation.endDate >= today)
        .toSorted(byDate('startDate')),
      inProgress: observations.filter((observation) => observation.state === 'InProgress').toSorted(byDate('endDate')),
      overdue: observations.filter((observation) => observation.state === 'Overdue').toSorted(byDate('endDate')),
    };
  }, [currentData?.observations, plantingSiteId]);

  return { isLoaded: currentData !== undefined, scheduledObservations };
};

export default useScheduledObservations;
