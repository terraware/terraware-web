import { useEffect } from 'react';

import isEnabled from 'src/features';
import { useLazyGetObservationResultsQuery } from 'src/queries/generated/observations';

import { ObservationDepth } from './types';

type UseOneObservationResultsArgs = {
  observationId: number | undefined;
  depth?: ObservationDepth;
};

const useOneObservationResults = ({ observationId, depth }: UseOneObservationResultsArgs) => {
  const useNewTables = isEnabled('New Observation Results Tables');
  const [getObservationResults, result] = useLazyGetObservationResultsQuery();

  useEffect(() => {
    if (observationId !== undefined) {
      void getObservationResults({ observationId, depth, useNewTables }, true);
    }
  }, [depth, getObservationResults, observationId, useNewTables]);

  return result;
};

export default useOneObservationResults;
