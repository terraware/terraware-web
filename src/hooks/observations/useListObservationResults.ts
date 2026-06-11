import { useCallback, useEffect } from 'react';

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

  const reload = useCallback(
    (preferCacheValue: boolean = true) => {
      if (organizationId !== undefined) {
        void listObservationResults(
          { organizationId, plantingSiteId, depth, state, limit, useNewTables },
          preferCacheValue
        );
      }
    },
    [depth, limit, listObservationResults, organizationId, plantingSiteId, state, useNewTables]
  );

  useEffect(() => {
    reload();
  }, [depth, limit, listObservationResults, organizationId, plantingSiteId, reload, state, useNewTables]);

  useEffect(() => {
    const observationResults = result.currentData?.observations ?? [];
    if (observationResults.every((observationResult) => !observationResult.survivalRateCalculationInProgress)) {
      return;
    }

    const timeout = setTimeout(() => {
      reload(false);
    }, 60000);

    return () => clearTimeout(timeout);
  }, [
    depth,
    limit,
    listObservationResults,
    organizationId,
    plantingSiteId,
    reload,
    result.currentData?.observations,
    state,
    useNewTables,
  ]);

  return result;
};

export default useListObservationResults;
