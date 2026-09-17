import { useEffect, useMemo } from 'react';

import { PlantingSitePayload, StratumResponsePayload } from 'src/queries/generated/plantingSites';
import {
  LatestStratumObservationResult,
  useLazyGetLatestStrataObservationResultsQuery,
} from 'src/queries/search/strata';

export type StratumObservationResult = {
  site: PlantingSitePayload;
  stratum: StratumResponsePayload;
  result?: LatestStratumObservationResult;
};

const useLatestStrataObservationResults = (sites: PlantingSitePayload[], enabled = true) => {
  const [getLatestStrataObservationResults, response] = useLazyGetLatestStrataObservationResultsQuery();

  const plantingSiteIdsKey = useMemo(
    () =>
      sites
        .map(({ id }) => id)
        .sort((a, b) => a - b)
        .join(','),
    [sites]
  );

  const plantingSiteIds = useMemo(
    () => (plantingSiteIdsKey === '' ? [] : plantingSiteIdsKey.split(',').map(Number)),
    [plantingSiteIdsKey]
  );

  useEffect(() => {
    if (enabled && plantingSiteIds.length > 0) {
      void getLatestStrataObservationResults({ plantingSiteIds }, true);
    }
  }, [enabled, getLatestStrataObservationResults, plantingSiteIds]);

  const resultsByStratumId = useMemo(
    () => new Map((response.currentData ?? []).map((result) => [result.stratumId, result])),
    [response.currentData]
  );

  const strataResults = useMemo(
    (): StratumObservationResult[] =>
      enabled
        ? sites.flatMap((site) =>
            (site.strata ?? []).map((stratum) => ({
              site,
              stratum,
              result: resultsByStratumId.get(stratum.id),
            }))
          )
        : [],
    [enabled, resultsByStratumId, sites]
  );

  return { strataResults, isLoading: response.isFetching };
};

export default useLatestStrataObservationResults;
