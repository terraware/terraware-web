import { useEffect, useMemo } from 'react';

import {
  ObservationSiteStatsPayload,
  ObservationStratumStatsPayload,
  ObservationSubstratumStatsPayload,
  useLazyGetObservationStatsQuery,
} from 'src/queries/generated/observations';

export type SiteObservationStats = {
  stats?: ObservationSiteStatsPayload;
  strataById: Map<number, ObservationStratumStatsPayload>;
  substrataById: Map<number, ObservationSubstratumStatsPayload>;
  isLoading: boolean;
};

/**
 * Latest observation statistics for a site, resolved per stratum and per substratum rather than
 * from whichever observation the site saw last. Every stratum and substratum is present; the ones
 * never observed carry no observationId.
 */
const useSiteObservationStats = (plantingSiteId: number | undefined): SiteObservationStats => {
  const [getObservationStats, response] = useLazyGetObservationStatsQuery();

  useEffect(() => {
    if (plantingSiteId !== undefined) {
      void getObservationStats({ plantingSiteId }, true);
    }
  }, [getObservationStats, plantingSiteId]);

  // Matching on id also guards against rendering the previous site's numbers mid-switch.
  const stats = useMemo(
    () => response.currentData?.stats.find((siteStats) => siteStats.plantingSiteId === plantingSiteId),
    [plantingSiteId, response.currentData]
  );

  const strataById = useMemo(
    () => new Map((stats?.strata ?? []).map((stratum) => [stratum.stratumId, stratum])),
    [stats]
  );

  const substrataById = useMemo(
    () =>
      new Map(
        (stats?.strata ?? [])
          .flatMap((stratum) => stratum.substrata)
          .map((substratum) => [substratum.substratumId, substratum])
      ),
    [stats]
  );

  return { stats, strataById, substrataById, isLoading: response.isFetching };
};

export default useSiteObservationStats;
