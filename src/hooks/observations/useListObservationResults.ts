import { useEffect } from 'react';

import { ALL_PLANTING_SITES, type PlantingSiteId } from 'src/hooks/useStickyPlantingSiteId';
import { useLazyListObservationResultsQuery } from 'src/queries/generated/observations';
import { ObservationState } from 'src/types/Observations';

import { ObservationDepth } from './types';

type UseListObservationResultsArgs = {
  organizationId: number | undefined;
  plantingSiteId?: PlantingSiteId;
  depth?: ObservationDepth;
  state?: ObservationState[];
  limit?: number;
};

const useListObservationResults = ({
  organizationId,
  plantingSiteId,
  depth,
  state,
  limit,
}: UseListObservationResultsArgs) => {
  const [listObservationResults, result] = useLazyListObservationResultsQuery();

  // Listing results for 'all' planting sites means querying with no site filter.
  const plantingSiteIdFilter = plantingSiteId === ALL_PLANTING_SITES ? undefined : plantingSiteId;

  useEffect(() => {
    if (organizationId !== undefined) {
      void listObservationResults({ organizationId, plantingSiteId: plantingSiteIdFilter, depth, state, limit }, true);
    }
  }, [depth, limit, listObservationResults, organizationId, plantingSiteIdFilter, state]);

  return result;
};

export default useListObservationResults;
