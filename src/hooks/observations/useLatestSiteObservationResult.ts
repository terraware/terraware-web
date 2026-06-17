import { useMemo } from 'react';

import usePlantingSite from 'src/hooks/usePlantingSite';

import { ObservationDepth } from './types';
import useGetOneObservationResults from './useOneObservationResults';

/** Resolves a planting site's latest observation and returns that observation's results. */
const useLatestSiteObservationResult = (plantingSiteId: number | undefined, depth: ObservationDepth = 'Plot') => {
  const { plantingSite, isLoading: isSiteLoading } = usePlantingSite(plantingSiteId);

  const observationResultsResponse = useGetOneObservationResults({
    observationId: plantingSite?.latestObservationId,
    depth,
  });

  const observation = useMemo(() => {
    const result = observationResultsResponse.currentData?.observation;
    return result?.plantingSiteId === plantingSiteId ? result : undefined;
  }, [observationResultsResponse.currentData?.observation, plantingSiteId]);

  return {
    observation,
    isLoading: isSiteLoading || observationResultsResponse.isFetching,
  };
};

export default useLatestSiteObservationResult;
