import { useMemo } from 'react';

import { useListObservationResults } from 'src/hooks/observations';
import { type PlantingSiteId } from 'src/hooks/useStickyPlantingSiteId';
import { useOrganization } from 'src/providers';

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
  const { dateFilter, statusFilter, stratumFilter, substratumFilter } = useObservationFilters();
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

      const observationDate = (observation.completedTime ?? observation.startDate).substring(0, 10);
      if (dateFilter.from !== undefined && observationDate < dateFilter.from) {
        return false;
      }
      if (dateFilter.to !== undefined && observationDate > dateFilter.to) {
        return false;
      }

      if (!isAssigned) {
        return true;
      }

      const matchesStratum = observation.strata.some(
        (stratum) => stratum.stratumId !== undefined && stratumFilter.includes(stratum.stratumId)
      );
      if (stratumFilter.length > 0 && !matchesStratum) {
        return false;
      }

      return (
        substratumFilter.length === 0 ||
        observation.strata
          .flatMap((stratum) => stratum.substrata)
          .some(
            (substratum) => substratum.substratumId !== undefined && substratumFilter.includes(substratum.substratumId)
          )
      );
    });
  }, [dateFilter, isAssigned, observationType, response, statusFilter, stratumFilter, substratumFilter]);

  return {
    isFetching: response.isFetching,
    isLoading: response.isLoading,
    observations,
  };
};

export default useFilteredObservationResults;
