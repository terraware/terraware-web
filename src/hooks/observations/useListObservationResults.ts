import { useEffect } from 'react';

import isEnabled from 'src/features';
import { useLazyListObservationResultsQuery } from 'src/queries/generated/observations';
import { ObservationState } from 'src/types/Observations';

import { ObservationDepth } from './types';

type UseListObservationResultsArgs = {
  organizationId: number | undefined;
  plantingSiteId?: number;
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
  const useNewTables = isEnabled('New Observation Results Tables');
  const [listObservationResults, result] = useLazyListObservationResultsQuery();

  useEffect(() => {
    if (organizationId !== undefined) {
      void listObservationResults({ organizationId, plantingSiteId, depth, state, limit, useNewTables }, true);
    }
  }, [depth, limit, listObservationResults, organizationId, plantingSiteId, state, useNewTables]);

  return result;
};

export default useListObservationResults;
