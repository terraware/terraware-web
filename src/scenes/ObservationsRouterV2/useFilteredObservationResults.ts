import { useMemo } from 'react';

import { useListObservationResults } from 'src/hooks/observations';
import { type PlantingSiteId } from 'src/hooks/useStickyPlantingSiteId';
import { useOrganization } from 'src/providers';

import { ObservationTypeFilter, PlotType, useObservationFilters } from './ObservationFiltersProvider';

type UseFilteredObservationResultsArgs = {
  enabled?: boolean;
  includeUpcoming?: boolean;
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
  includeUpcoming = false,
  observationType,
  plantingSiteId,
  plotType,
}: UseFilteredObservationResultsArgs) => {
  const { selectedOrganization } = useOrganization();
  const { dateFilter } = useObservationFilters();
  const isAdHoc = plotType === 'adHoc';

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
      if (observation.type !== observationType || (!includeUpcoming && observation.state === 'Upcoming')) {
        return false;
      }

      const observationDate = (observation.completedTime ?? observation.startDate).substring(0, 10);

      return (
        (dateFilter.from === undefined || observationDate >= dateFilter.from) &&
        (dateFilter.to === undefined || observationDate <= dateFilter.to)
      );
    });
  }, [dateFilter, includeUpcoming, observationType, response]);

  return {
    isFetching: response.isFetching,
    isLoading: response.isLoading,
    observations,
  };
};

export default useFilteredObservationResults;
