import { useCallback, useEffect } from 'react';

import isEnabled from 'src/features';
import { useLazyGetObservationResultsQuery } from 'src/queries/generated/observations';

import { ObservationDepth } from './types';

type UseGetOneObservationResultsArgs = {
  observationId: number | undefined;
  depth?: ObservationDepth;
};

const useGetOneObservationResults = ({ observationId, depth }: UseGetOneObservationResultsArgs) => {
  const useNewTables = isEnabled('New Observation Results Tables');
  const [getObservationResults, result] = useLazyGetObservationResultsQuery();

  const reload = useCallback(
    (preferCacheValue: boolean = true) => {
      if (observationId !== undefined) {
        void getObservationResults({ observationId, depth, useNewTables }, preferCacheValue);
      }
    },
    [depth, getObservationResults, observationId, useNewTables]
  );

  useEffect(() => {
    reload();
  }, [depth, getObservationResults, observationId, reload, useNewTables]);

  useEffect(() => {
    if (result.currentData?.observation.survivalRateCalculationInProgress) {
      const timeout = setTimeout(() => {
        reload(false);
      }, 60000);

      return () => clearTimeout(timeout);
    }
  }, [reload, result.currentData?.observation.survivalRateCalculationInProgress]);

  return result;
};

export default useGetOneObservationResults;
