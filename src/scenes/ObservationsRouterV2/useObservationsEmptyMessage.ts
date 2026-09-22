import { useMemo } from 'react';

import { useLocalization } from 'src/providers';

import { useObservationFilters } from './ObservationFiltersProvider';
import { ObservationsEmptyState } from './useFilteredObservationResults';

const useObservationsEmptyMessage = (emptyState?: ObservationsEmptyState): string | undefined => {
  const { strings } = useLocalization();
  const { observationType, plotType } = useObservationFilters();

  return useMemo(() => {
    if (emptyState === undefined) {
      return undefined;
    }

    if (emptyState === 'noFilterMatches') {
      return strings.NO_OBSERVATIONS_MATCH_FILTERS;
    }

    if (plotType === 'assigned') {
      return strings.NO_ASSIGNED_PLOT_OBSERVATIONS_RECORDED;
    }

    if (observationType === 'Biomass Measurements') {
      return strings.NO_BIOMASS_OBSERVATIONS_RECORDED;
    }

    return strings.NO_AD_HOC_PLOT_OBSERVATIONS_RECORDED;
  }, [emptyState, observationType, plotType, strings]);
};

export default useObservationsEmptyMessage;
