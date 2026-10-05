import { useCallback, useEffect, useMemo } from 'react';

import { getDateDisplayValue } from '@terraware/web-components/utils';

import usePlantingSite from 'src/hooks/usePlantingSite';
import { type PlantingSiteId } from 'src/hooks/useStickyPlantingSiteId';
import { ObservationResultsPayload } from 'src/queries/generated/observations';
import { useDefaultTimeZone } from 'src/utils/useTimeZoneUtils';

import { useObservationFilters } from '../ObservationFiltersProvider';
import { useSelectedObservation } from '../SelectedObservationProvider';
import useFilteredObservationResults from '../useFilteredObservationResults';

/** The filtered observations in date order, each dated by completion if it has one, otherwise by start. */
export const useTimelineObservations = (plantingSiteId: PlantingSiteId) => {
  const defaultTimezone = useDefaultTimeZone().get().id;
  const { observationType, plotType } = useObservationFilters();
  const { plantingSite } = usePlantingSite(typeof plantingSiteId === 'number' ? plantingSiteId : undefined);

  const { emptyState, observations } = useFilteredObservationResults({ observationType, plantingSiteId, plotType });

  const timezone = plantingSite?.timeZone ?? defaultTimezone;

  const observationDate = useCallback(
    (observation: ObservationResultsPayload) =>
      observation.completedTime
        ? getDateDisplayValue(observation.completedTime, timezone)
        : observation.startDate.substring(0, 10),
    [timezone]
  );

  const sortedObservations = useMemo(
    () => [...observations].sort((a, b) => observationDate(a).localeCompare(observationDate(b))),
    [observationDate, observations]
  );

  return { emptyState, observationDate, sortedObservations };
};

/**
 * Keeps an assigned-plot observation of one site selected for the map, defaulting to the latest one that isn't in
 * the future. Runs whether or not the timeline is on screen.
 */
export const useDefaultObservationSelection = (plantingSiteId: PlantingSiteId) => {
  const { plotType } = useObservationFilters();
  const { selectObservation, selectedObservationId } = useSelectedObservation();
  const { observationDate, sortedObservations } = useTimelineObservations(plantingSiteId);

  const isEnabled = plotType === 'assigned' && plantingSiteId !== 'all';

  useEffect(() => {
    if (!isEnabled || sortedObservations.length === 0) {
      return;
    }

    const isSelectionShown = sortedObservations.some(
      (observation) => observation.observationId === selectedObservationId
    );
    if (isSelectionShown) {
      return;
    }

    const today = new Date().valueOf();
    const latestPast = sortedObservations.findLast(
      (observation) => new Date(observationDate(observation)).valueOf() <= today
    );
    selectObservation((latestPast ?? sortedObservations[0]).observationId);
  }, [isEnabled, observationDate, selectObservation, selectedObservationId, sortedObservations]);
};
