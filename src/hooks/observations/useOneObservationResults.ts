import { useEffect } from 'react';

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

  useEffect(() => {
    if (observationId !== undefined) {
      void getObservationResults({ observationId, depth, useNewTables }, true);
    }
  }, [depth, getObservationResults, observationId, useNewTables]);

  return result;
};

export default useGetOneObservationResults;
