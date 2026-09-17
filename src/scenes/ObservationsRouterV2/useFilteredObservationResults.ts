import { useMemo } from 'react';

import { getDateDisplayValue } from '@terraware/web-components/utils';

import { useListObservationResults } from 'src/hooks/observations';
import { type PlantingSiteId } from 'src/hooks/useStickyPlantingSiteId';
import { useOrganization } from 'src/providers';
import { useDefaultTimeZone } from 'src/utils/useTimeZoneUtils';

import { ObservationTypeFilter, PlotType, useObservationFilters } from './ObservationFiltersProvider';

type UseFilteredObservationResultsArgs = {
  enabled?: boolean;
  observationType: ObservationTypeFilter;
  plantingSiteId?: PlantingSiteId;
  plotType: PlotType;
};

/**
 * The observation results for one set of filters. Assigned and ad-hoc plots come from the same
 * endpoint at different depths, so every consumer of the same filters shares a cache entry.
 */
const useFilteredObservationResults = ({
  enabled = true,
  observationType,
  plantingSiteId,
  plotType,
}: UseFilteredObservationResultsArgs) => {
  const { selectedOrganization } = useOrganization();
  const { dateFilter, plotNumberFilter, statusFilter, stratumFilter } = useObservationFilters();
  const defaultTimezone = useDefaultTimeZone().get().id;
  const isAdHoc = plotType === 'adHoc';
  const isAssigned = !isAdHoc;

  const response = useListObservationResults({
    depth: isAdHoc ? 'Plant' : 'Stratum',
    isAdHoc: isAdHoc ? true : undefined,
    organizationId: enabled ? selectedOrganization?.id : undefined,
    plantingSiteId,
  });

  const observations = useMemo(() => {
    if (!response.isSuccess) {
      return [];
    }

    return response.data.observations.filter((observation) => {
      if (observation.type !== observationType) {
        return false;
      }

      if (isAssigned && statusFilter.length > 0 && !statusFilter.includes(observation.state)) {
        return false;
      }

      // The tables and timeline show completed times in a time zone, so compare the same date.
      const observationDate = observation.completedTime
        ? getDateDisplayValue(observation.completedTime, defaultTimezone)
        : observation.startDate.substring(0, 10);
      if (dateFilter.from !== undefined && observationDate < dateFilter.from) {
        return false;
      }
      if (dateFilter.to !== undefined && observationDate > dateFilter.to) {
        return false;
      }

      if (!isAssigned) {
        const plotNumber = observation.adHocPlot?.monitoringPlotNumber;
        const belowMin =
          plotNumberFilter.min !== undefined && (plotNumber === undefined || plotNumber < plotNumberFilter.min);
        const aboveMax =
          plotNumberFilter.max !== undefined && (plotNumber === undefined || plotNumber > plotNumberFilter.max);

        return !belowMin && !aboveMax;
      }

      const matchesStratum = observation.strata.some(
        (stratum) => stratum.stratumId !== undefined && stratumFilter.includes(stratum.stratumId)
      );

      return stratumFilter.length === 0 || matchesStratum;
    });
  }, [
    dateFilter,
    defaultTimezone,
    isAssigned,
    observationType,
    plotNumberFilter,
    response,
    statusFilter,
    stratumFilter,
  ]);

  return {
    isFetching: response.isFetching,
    isLoading: response.isLoading,
    observations,
  };
};

export default useFilteredObservationResults;
