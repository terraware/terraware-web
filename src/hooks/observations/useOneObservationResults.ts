import { useEffect } from 'react';

import { useLazyGetObservationResultsQuery } from 'src/queries/generated/observations';

import { ObservationDepth } from './types';

type UseGetOneObservationResultsArgs = {
  observationId: number | undefined;
  depth?: ObservationDepth;
};

const useGetOneObservationResults = ({ observationId, depth }: UseGetOneObservationResultsArgs) => {
  const [getObservationResults, result] = useLazyGetObservationResultsQuery();

  useEffect(() => {
    if (observationId !== undefined) {
      void getObservationResults({ observationId, depth }, true);
    }
  }, [depth, getObservationResults, observationId]);

  return result;
};

export default useGetOneObservationResults;
