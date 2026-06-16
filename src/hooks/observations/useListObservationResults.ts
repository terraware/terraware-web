import { useEffect } from 'react';

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
  const [listObservationResults, result] = useLazyListObservationResultsQuery();

  useEffect(() => {
    if (organizationId !== undefined) {
      void listObservationResults({ organizationId, plantingSiteId, depth, state, limit, useNewTables: true }, true);
    }
  }, [depth, limit, listObservationResults, organizationId, plantingSiteId, state]);

  return result;
};

export default useListObservationResults;
