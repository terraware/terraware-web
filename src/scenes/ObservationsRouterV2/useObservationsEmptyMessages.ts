import { useMemo } from 'react';

import { useLocalization } from 'src/providers';

import { useObservationFilters } from './ObservationFiltersProvider';
import { ObservationsEmptyState } from './useFilteredObservationResults';

/** The lines to show in place of observations, the first of which is short enough to overlay. */
const useObservationsEmptyMessages = (emptyState?: ObservationsEmptyState): string[] | undefined => {
  const { strings } = useLocalization();
  const { observationType, plotType } = useObservationFilters();

  return useMemo(() => {
    if (emptyState === undefined) {
      return undefined;
    }

    if (emptyState === 'noFilterMatches') {
      return [strings.NO_OBSERVATIONS_MATCH_FILTERS, strings.ADJUST_FILTERS_TO_SEE_OBSERVATIONS];
    }

    if (plotType === 'assigned') {
      return [strings.OBSERVATIONS_EMPTY_STATE_MESSAGE_1, strings.OBSERVATIONS_EMPTY_STATE_MESSAGE_2];
    }

    if (observationType === 'Biomass Measurements') {
      return [strings.BIOMASS_EMPTY_STATE_MESSAGE_1, strings.BIOMASS_EMPTY_STATE_MESSAGE_2];
    }

    return [strings.AD_HOC_OBSERVATIONS_EMPTY_STATE_MESSAGE_1, strings.AD_HOC_OBSERVATIONS_EMPTY_STATE_MESSAGE_2];
  }, [emptyState, observationType, plotType, strings]);
};

export default useObservationsEmptyMessages;
