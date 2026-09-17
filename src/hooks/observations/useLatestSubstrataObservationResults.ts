import { useEffect, useMemo } from 'react';

import {
  PlantingSitePayload,
  StratumResponsePayload,
  SubstratumResponsePayload,
} from 'src/queries/generated/plantingSites';
import {
  LatestSubstratumObservationResult,
  useLazyGetLatestSubstrataObservationResultsQuery,
} from 'src/queries/search/substrata';

export type SubstratumObservationResult = {
  site: PlantingSitePayload;
  stratum: StratumResponsePayload;
  substratum: SubstratumResponsePayload;
  result?: LatestSubstratumObservationResult;
};

const useLatestSubstrataObservationResults = (sites: PlantingSitePayload[], enabled = true) => {
  const [getLatestSubstrataObservationResults, response] = useLazyGetLatestSubstrataObservationResultsQuery();

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
      void getLatestSubstrataObservationResults({ plantingSiteIds }, true);
    }
  }, [enabled, getLatestSubstrataObservationResults, plantingSiteIds]);

  const resultsBySubstratumId = useMemo(
    () => new Map((response.currentData ?? []).map((result) => [result.substratumId, result])),
    [response.currentData]
  );

  const substrataResults = useMemo(
    (): SubstratumObservationResult[] =>
      enabled
        ? sites.flatMap((site) =>
            (site.strata ?? []).flatMap((stratum) =>
              stratum.substrata.map((substratum) => ({
                site,
                stratum,
                substratum,
                result: resultsBySubstratumId.get(substratum.id),
              }))
            )
          )
        : [],
    [enabled, resultsBySubstratumId, sites]
  );

  return { substrataResults, isLoading: response.isFetching };
};

export default useLatestSubstrataObservationResults;
